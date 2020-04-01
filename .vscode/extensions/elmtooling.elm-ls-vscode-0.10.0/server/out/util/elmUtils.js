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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const execa_1 = __importDefault(require("execa"));
const path = __importStar(require("path"));
const vscode_languageserver_1 = require("vscode-languageserver");
exports.isWindows = process.platform === "win32";
/** Executes a command. Shows an error message if the command isn't found */
function execCmd(cmdFromUser, cmdStatic, options = {}, cwd, connection, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = cmdFromUser === "" ? cmdStatic : cmdFromUser;
        const preferLocal = cmdFromUser === "";
        const cmdArguments = options ? options.cmdArguments : [];
        try {
            return yield execa_1.default(cmd, cmdArguments, {
                cwd,
                input,
                preferLocal,
                stripFinalNewline: false,
            });
        }
        catch (error) {
            if (error.errno === "ENOENT") {
                connection.window.showErrorMessage(options.notFoundText
                    ? options.notFoundText
                    : `Cannot find executable with name '${cmd}'`);
                return Promise.reject("Executable not found");
            }
            else {
                return Promise.reject(error);
            }
        }
    });
}
exports.execCmd = execCmd;
function isTestFile(filename, rootPath) {
    const testFolder = path.join(rootPath, "tests");
    if (filename.startsWith(testFolder)) {
        return true;
    }
    return false;
}
exports.isTestFile = isTestFile;
// Special type that has no core mock https://github.com/elm/compiler/blob/51e20357137ebc9c3f6136cf0a3fe21c24027f39/compiler/src/Canonicalize/Environment/Foreign.hs#L62
function getEmptyTypes() {
    return [
        {
            markdown: `An \`List\` is a list of items. Every item must be of the same type. Valid syntax for lists includes:

    []
    [42, 43]
    ["one", "two", "three"]
    [3.14, 0.1234]
    ['a', 'Z', '0']

    `,
            name: "List",
            symbolKind: vscode_languageserver_1.SymbolKind.Enum,
        },
    ];
}
exports.getEmptyTypes = getEmptyTypes;
function getElmVersion(settings, elmWorkspaceFolder, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            cmdArguments: ["--version"],
            notFoundText: "Elm binary not found, did you install and setup the path to your binary?",
        };
        const result = yield execCmd(settings.elmPath, "elm", options, elmWorkspaceFolder.fsPath, connection);
        const version = result.stdout.trim();
        connection.console.info(`Elm version ${version} detected.`);
        return Promise.resolve(version);
    });
}
exports.getElmVersion = getElmVersion;
function findDepVersion(allVersionFolders, versionRange) {
    const regex = /^(\d+\.\d+\.\d+) (<|<=) v (<|<=) (\d+\.\d+\.\d+)$/gm;
    const m = regex.exec(versionRange);
    if (m) {
        const lowerRange = m[1];
        const lowerOperator = m[2];
        const upperOperator = m[3];
        const upperRange = m[4];
        const filteredVersionList = allVersionFolders
            .filter((a) => filterSemver(a.version, lowerRange, lowerOperator))
            .filter((a) => filterSemver(upperRange, a.version, upperOperator));
        const latestVersionInRange = filteredVersionList
            .map((a) => a.version)
            .sort(cmp)
            .reverse()[0];
        return allVersionFolders.find((a) => a.version === latestVersionInRange);
    }
    else {
        // Regex did not work, probably not a version range
        return allVersionFolders.find((it) => versionRange.includes(it.version));
    }
}
exports.findDepVersion = findDepVersion;
function filterSemver(lower, upper, operator) {
    const currentCompare = cmp(lower, upper);
    switch (operator) {
        case "<=":
            if (currentCompare === -1) {
                return false;
            }
            else {
                return true;
            }
        case "<":
            if (currentCompare === -1 || currentCompare === 0) {
                return false;
            }
            else {
                return true;
            }
    }
}
function cmp(a, b) {
    const pa = a.split(".");
    const pb = b.split(".");
    for (let i = 0; i < 3; i++) {
        const na = Number(pa[i]);
        const nb = Number(pb[i]);
        if (na > nb) {
            return 1;
        }
        if (nb > na) {
            return -1;
        }
        if (!isNaN(na) && isNaN(nb)) {
            return 1;
        }
        if (isNaN(na) && !isNaN(nb)) {
            return -1;
        }
    }
    return 0;
}
//# sourceMappingURL=elmUtils.js.map