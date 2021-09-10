#!/usr/bin/env node

import { prompt } from 'inquirer';
import { spawn } from 'child_process';

enum DeleteType {
  Hard = '-D',
  Soft = '-d',
  Abort = 'abort',
};

type BranchChoice = {
  name: string;
  disabled: boolean;
}

const excludedBranches = [
  'master', 'staging', 'development', 'main',
];

const isExcludedBranch = (branch: string) => {
  return excludedBranches.includes(branch);
};

const defaultPageSize = 12;

const getPagesize = (): number => {
  const lines = Number(process?.stdout?.rows);
  return lines > 0 ? lines / 2 : defaultPageSize;
}

const fetchBranches = async (): Promise<BranchChoice[]> => {
  const { out } = await cmdRunner('git', ['branch']);

  return out.split('\n')
  .filter(t => t)
  .map(t => t.trim())
  .map(name => ({
    name,
    disabled: name.includes('*') || isExcludedBranch(name),
  }));
};

const pickBranches = async (): Promise<string[]> => {
  const choices = await fetchBranches();

  const answer = await prompt<{ branches: string[] }>({
    type: 'checkbox',
    name: 'branches',
    message: 'Branches?',
    choices,
    pageSize: getPagesize(),
  });

  if (!answer?.branches?.length) {
    return [];
  }

  return answer.branches;
};

const pickRemotes = async (): Promise<string[]> => {
  const { out } = await cmdRunner('git', ['remote']);

  const choices = out.split('\n')
  .filter(t => t)
  .map(t => t.trim())
  .map(name => ({
    name,
  }));

  const answer = await prompt({
    type: 'checkbox',
    name: 'remotes',
    message: 'Remotes?',
    suffix: 'Select remotes you want to try to delete the branch at as well',
    choices,
    pageSize: getPagesize(),
  });

  if (!answer?.remotes?.length) {
    return [];
  }

  return answer.remotes;
};

const hardOrSoftDelete = async () => {
  const answer = await prompt({
    type: 'list',
    name: 'hardorsoft',
    message: '-d or -D',
    choices: [{
      name: '-d',
      value: 'soft',
      checked: true,
    }, {
      name: '-D',
      value: 'hard',
    }, {
      type: 'separator'
    }, {
      name: 'Abort',
      value: 'abort',
    }],
    pageSize: getPagesize(),
  });

  if (answer.hardorsoft === 'abort') {
    return DeleteType.Abort;
  }

  return answer.hardorsoft === 'hard' ? DeleteType.Hard : DeleteType.Soft
};

const cmdRunner = (cmd: string, params: string[]) : Promise<{ code: number, out: string, err: string }> => {
  return new Promise((resolve, reject) => {
    const run = spawn(cmd, params);

    let out: string = '';
    let err: string = '';

    run.stdout.on('data', (data: any) => {
      out += data.toString();
    });

    run.stderr.on('data', (data: any) => {
      err += data.toString();
    });

    run.on('close', (code: number) => {
      if (code !== 0) {
        return reject(new Error(err));
      }

      return resolve({ code, out, err });
    });
  });
};

type DeleteResult = {
  branch: string;
  success: boolean;

  err?: string;
};

const deleteOneLocalBranch = async (branch: string, whatD: string): Promise<DeleteResult> => {
  try {
    await cmdRunner('git', ['branch', whatD, branch]);
    return {
      branch,
      success: true,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');

    return {
      branch,
      success: false,
      err: error.message,
    }
  }
};

const deleteOneRemoteBranch = async (branch: string, remote: string): Promise<DeleteResult> => {
  try {
    await cmdRunner('git', ['push', remote, '--delete', branch]);
    return {
      branch,
      success: true,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');

    return {
      branch,
      success: false,
      err: error.message,
    }
  }
};

const deleteOneBranch = async (branch: string, deleteType: DeleteType, remotes: string[] = []) => {
  const [ local, remote ] = await Promise.all([
    deleteOneLocalBranch(branch, deleteType),
    ...remotes.map(r => deleteOneRemoteBranch(branch, r)),
  ])

  return { local, remote };
};

const deleteBranches = (branches: string[], deleteType: DeleteType, remotes: string[] = []) => {
  return Promise.all(branches.map(b => deleteOneBranch(b, deleteType, remotes)));
};

const confirmDirectory = async () : Promise<boolean> => {
  const answer = await prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Are you sure you want to delete branches in ${process.env.PWD}`,
  });

  if (!answer?.confirm) {
    return false;
  }

  return true;
};

const main = async () => {
  const confirm = await confirmDirectory();
  if (!confirm) {
    console.log('You are not sure, aborting.');
    return 0;
  }

  const branches = await pickBranches();

  if (!branches?.length) {
    console.log('No branches selected, aborting');
    return 0;
  }

  const deleteType = await hardOrSoftDelete();

  if (deleteType === DeleteType.Abort) {
    console.log('Aborting...');
    return 0;
  }

  const remotes = await pickRemotes();

  const deletedBranches = await deleteBranches(branches, deleteType, remotes);

  const deletedLocal = deletedBranches.filter(r => r.local && r.local.success).map(r => r.local);
  const failedLocal = deletedBranches.filter(r => r.local && !r.local.success).map(r => r.local);

  console.log(`Deleted ${deletedLocal.length} local branches, ${deletedLocal.map(l => l.branch).join(', ')}`);
  console.log(`Failed ${failedLocal.length} local branches, ${failedLocal.map(l => l.branch).join(', ')}`);

  const deletedRemote = deletedBranches.filter(r => r.remote && r.remote.success).map(r => r.remote);
  const failedRemote = deletedBranches.filter(r => r.remote && !r.remote.success).map(r => r.remote);

  console.log(`Deleted ${deletedRemote.length} remote branches, ${deletedRemote.map(l => l.branch).join(', ')}`);
  console.log(`Failed ${failedRemote.length} remote branches, ${failedRemote.map(l => l.branch).join(', ')}`);
};

cmdRunner('command', ['-v', 'git'])
.then(_ => {
  return main();
})
.catch(err => {
  console.error(`Error: ${err}`);
});
