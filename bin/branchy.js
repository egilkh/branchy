#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer_1 = require("inquirer");
var child_process_1 = require("child_process");
var DeleteType;
(function (DeleteType) {
    DeleteType["Hard"] = "-D";
    DeleteType["Soft"] = "-d";
    DeleteType["Abort"] = "abort";
})(DeleteType || (DeleteType = {}));
;
var excludedBranches = [
    'master', 'staging', 'development', 'main',
];
var isExcludedBranch = function (branch) {
    return excludedBranches.includes(branch);
};
var defaultPageSize = 12;
var getPagesize = function () {
    var _a;
    var lines = Number((_a = process === null || process === void 0 ? void 0 : process.stdout) === null || _a === void 0 ? void 0 : _a.rows);
    return lines > 0 ? lines / 2 : defaultPageSize;
};
var fetchBranches = function () { return __awaiter(void 0, void 0, void 0, function () {
    var out;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cmdRunner('git', ['branch'])];
            case 1:
                out = (_a.sent()).out;
                return [2 /*return*/, out.split('\n')
                        .filter(function (t) { return t; })
                        .map(function (t) { return t.trim(); })
                        .map(function (name) { return ({
                        name: name,
                        disabled: name.includes('*') || isExcludedBranch(name),
                    }); })];
        }
    });
}); };
var pickBranches = function () { return __awaiter(void 0, void 0, void 0, function () {
    var choices, answer;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, fetchBranches()];
            case 1:
                choices = _b.sent();
                return [4 /*yield*/, (0, inquirer_1.prompt)({
                        type: 'checkbox',
                        name: 'branches',
                        message: 'Branches?',
                        choices: choices,
                        pageSize: getPagesize(),
                    })];
            case 2:
                answer = _b.sent();
                if (!((_a = answer === null || answer === void 0 ? void 0 : answer.branches) === null || _a === void 0 ? void 0 : _a.length)) {
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, answer.branches];
        }
    });
}); };
var pickRemotes = function () { return __awaiter(void 0, void 0, void 0, function () {
    var out, choices, answer;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, cmdRunner('git', ['remote'])];
            case 1:
                out = (_b.sent()).out;
                choices = out.split('\n')
                    .filter(function (t) { return t; })
                    .map(function (t) { return t.trim(); })
                    .map(function (name) { return ({
                    name: name,
                }); });
                return [4 /*yield*/, (0, inquirer_1.prompt)({
                        type: 'checkbox',
                        name: 'remotes',
                        message: 'Remotes?',
                        suffix: 'Select remotes you want to try to delete the branch at as well',
                        choices: choices,
                        pageSize: getPagesize(),
                    })];
            case 2:
                answer = _b.sent();
                if (!((_a = answer === null || answer === void 0 ? void 0 : answer.remotes) === null || _a === void 0 ? void 0 : _a.length)) {
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, answer.remotes];
        }
    });
}); };
var hardOrSoftDelete = function () { return __awaiter(void 0, void 0, void 0, function () {
    var answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, inquirer_1.prompt)({
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
                })];
            case 1:
                answer = _a.sent();
                if (answer.hardorsoft === 'abort') {
                    return [2 /*return*/, DeleteType.Abort];
                }
                return [2 /*return*/, answer.hardorsoft === 'hard' ? DeleteType.Hard : DeleteType.Soft];
        }
    });
}); };
var cmdRunner = function (cmd, params) {
    return new Promise(function (resolve, reject) {
        var run = (0, child_process_1.spawn)(cmd, params);
        var out = '';
        var err = '';
        run.stdout.on('data', function (data) {
            out += data.toString();
        });
        run.stderr.on('data', function (data) {
            err += data.toString();
        });
        run.on('close', function (code) {
            if (code !== 0) {
                return reject(new Error(err));
            }
            return resolve({ code: code, out: out, err: err });
        });
    });
};
var deleteOneLocalBranch = function (branch, whatD) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, cmdRunner('git', ['branch', whatD, branch])];
            case 1:
                _a.sent();
                return [2 /*return*/, {
                        branch: branch,
                        success: true,
                    }];
            case 2:
                err_1 = _a.sent();
                error = err_1 instanceof Error ? err_1 : new Error('Unknown error');
                return [2 /*return*/, {
                        branch: branch,
                        success: false,
                        err: error.message,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteOneRemoteBranch = function (branch, remote) { return __awaiter(void 0, void 0, void 0, function () {
    var err_2, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, cmdRunner('git', ['push', remote, '--delete', branch])];
            case 1:
                _a.sent();
                return [2 /*return*/, {
                        branch: branch,
                        success: true,
                    }];
            case 2:
                err_2 = _a.sent();
                error = err_2 instanceof Error ? err_2 : new Error('Unknown error');
                return [2 /*return*/, {
                        branch: branch,
                        success: false,
                        err: error.message,
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteOneBranch = function (branch, deleteType, remotes) {
    if (remotes === void 0) { remotes = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, local, remote;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all(__spreadArray([
                        deleteOneLocalBranch(branch, deleteType)
                    ], remotes.map(function (r) { return deleteOneRemoteBranch(branch, r); }), true))];
                case 1:
                    _a = _b.sent(), local = _a[0], remote = _a[1];
                    return [2 /*return*/, { local: local, remote: remote }];
            }
        });
    });
};
var deleteBranches = function (branches, deleteType, remotes) {
    if (remotes === void 0) { remotes = []; }
    return Promise.all(branches.map(function (b) { return deleteOneBranch(b, deleteType, remotes); }));
};
var confirmDirectory = function () { return __awaiter(void 0, void 0, void 0, function () {
    var answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, inquirer_1.prompt)({
                    type: 'confirm',
                    name: 'confirm',
                    message: "Are you sure you want to delete branches in " + process.env.PWD,
                })];
            case 1:
                answer = _a.sent();
                if (!(answer === null || answer === void 0 ? void 0 : answer.confirm)) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, true];
        }
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var confirm, branches, deleteType, remotes, deletedBranches, deletedLocal, failedLocal, deletedRemote, failedRemote;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, confirmDirectory()];
            case 1:
                confirm = _a.sent();
                if (!confirm) {
                    console.log('You are not sure, aborting.');
                    return [2 /*return*/, 0];
                }
                return [4 /*yield*/, pickBranches()];
            case 2:
                branches = _a.sent();
                if (!(branches === null || branches === void 0 ? void 0 : branches.length)) {
                    console.log('No branches selected, aborting');
                    return [2 /*return*/, 0];
                }
                return [4 /*yield*/, hardOrSoftDelete()];
            case 3:
                deleteType = _a.sent();
                if (deleteType === DeleteType.Abort) {
                    console.log('Aborting...');
                    return [2 /*return*/, 0];
                }
                return [4 /*yield*/, pickRemotes()];
            case 4:
                remotes = _a.sent();
                return [4 /*yield*/, deleteBranches(branches, deleteType, remotes)];
            case 5:
                deletedBranches = _a.sent();
                deletedLocal = deletedBranches.filter(function (r) { return r.local && r.local.success; }).map(function (r) { return r.local; });
                failedLocal = deletedBranches.filter(function (r) { return r.local && !r.local.success; }).map(function (r) { return r.local; });
                console.log("Deleted " + deletedLocal.length + " local branches, " + deletedLocal.map(function (l) { return l.branch; }).join(', '));
                console.log("Failed " + failedLocal.length + " local branches, " + failedLocal.map(function (l) { return l.branch; }).join(', '));
                deletedRemote = deletedBranches.filter(function (r) { return r.remote && r.remote.success; }).map(function (r) { return r.remote; });
                failedRemote = deletedBranches.filter(function (r) { return r.remote && !r.remote.success; }).map(function (r) { return r.remote; });
                console.log("Deleted " + deletedRemote.length + " remote branches, " + deletedRemote.map(function (l) { return l.branch; }).join(', '));
                console.log("Failed " + failedRemote.length + " remote branches, " + failedRemote.map(function (l) { return l.branch; }).join(', '));
                return [2 /*return*/];
        }
    });
}); };
cmdRunner('command', ['-v', 'git'])
    .then(function (_) {
    return main();
})
    .catch(function (err) {
    console.error("Error: " + err);
});
