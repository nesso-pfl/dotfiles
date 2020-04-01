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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const path = __importStar(require("path"));
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const utils = __importStar(require("../../util/elmUtils"));
const elmUtils_1 = require("../../util/elmUtils");
const elmWorkspaceMatcher_1 = require("../../util/elmWorkspaceMatcher");
const elmDiagnosticsHelper_1 = require("./elmDiagnosticsHelper");
const refactorEditUtils_1 = require("../../util/refactorEditUtils");
const importUtils_1 = require("../../util/importUtils");
const ELM_MAKE = "Elm";
const NAMING_ERROR = "NAMING ERROR";
const RANDOM_ID = crypto_1.randomBytes(16).toString("hex");
exports.CODE_ACTION_ELM_MAKE = `elmLS.elmMakeFixer-${RANDOM_ID}`;
class ElmMakeDiagnostics {
    constructor(connection, elmWorkspaces, settings) {
        this.connection = connection;
        this.settings = settings;
        this.neededImports = new Map();
        this.createDiagnostics = (filePath) => __awaiter(this, void 0, void 0, function* () {
            const workspaceRootPath = this.elmWorkspaceMatcher
                .getElmWorkspaceFor(filePath)
                .getRootPath();
            const diagnostics = yield this.checkForErrors(workspaceRootPath.fsPath, filePath.fsPath).then((issues) => {
                return issues.length === 0
                    ? new Map([[filePath.toString(), []]])
                    : elmDiagnosticsHelper_1.ElmDiagnosticsHelper.issuesToDiagnosticMap(issues, workspaceRootPath);
            });
            // Handle import all
            const forest = this.elmWorkspaceMatcher
                .getElmWorkspaceFor(filePath)
                .getForest();
            const exposedValues = importUtils_1.ImportUtils.getPossibleImports(forest);
            // Get all possible imports from the diagnostics for import all
            diagnostics.forEach((innerDiagnostics, uri) => {
                const sourceTree = forest.getByUri(uri);
                this.neededImports.set(uri, []);
                innerDiagnostics.forEach((diagnostic) => {
                    if (diagnostic.message.startsWith(NAMING_ERROR)) {
                        const valueNode = sourceTree === null || sourceTree === void 0 ? void 0 : sourceTree.tree.rootNode.namedDescendantForPosition({
                            column: diagnostic.range.start.character,
                            row: diagnostic.range.start.line,
                        }, {
                            column: diagnostic.range.end.character,
                            row: diagnostic.range.end.line,
                        });
                        // Find imports
                        if (valueNode) {
                            exposedValues
                                .filter((exposed) => exposed.value === valueNode.text ||
                                ((valueNode.type === "upper_case_qid" ||
                                    valueNode.type === "value_qid") &&
                                    exposed.value ===
                                        valueNode.namedChildren[valueNode.namedChildren.length - 1].text &&
                                    exposed.module === valueNode.namedChildren[0].text))
                                .forEach((exposed, i) => {
                                var _a;
                                if (i === 0) {
                                    (_a = this.neededImports.get(uri)) === null || _a === void 0 ? void 0 : _a.push({
                                        moduleName: exposed.module,
                                        valueName: valueNode.type !== "upper_case_qid" &&
                                            valueNode.type !== "value_qid"
                                            ? exposed.valueToImport
                                                ? exposed.valueToImport
                                                : exposed.value
                                            : undefined,
                                        diagnostic,
                                    });
                                }
                            });
                        }
                    }
                });
            });
            return diagnostics;
        });
        this.elmWorkspaceMatcher = new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (uri) => uri);
    }
    onCodeAction(params) {
        const { uri } = params.textDocument;
        const elmMakeDiagnostics = this.filterElmMakeDiagnostics(params.context.diagnostics);
        return this.convertDiagnosticsToCodeActions(elmMakeDiagnostics, uri);
    }
    convertDiagnosticsToCodeActions(diagnostics, uri) {
        const result = [];
        const forest = this.elmWorkspaceMatcher
            .getElmWorkspaceFor(vscode_uri_1.URI.parse(uri))
            .getForest();
        const exposedValues = importUtils_1.ImportUtils.getPossibleImports(forest);
        const sourceTree = forest.getByUri(uri);
        diagnostics.forEach((diagnostic) => {
            var _a, _b, _c;
            if (diagnostic.message.startsWith(NAMING_ERROR)) {
                const valueNode = sourceTree === null || sourceTree === void 0 ? void 0 : sourceTree.tree.rootNode.namedDescendantForPosition({
                    column: diagnostic.range.start.character,
                    row: diagnostic.range.start.line,
                }, {
                    column: diagnostic.range.end.character,
                    row: diagnostic.range.end.line,
                });
                let hasImportFix = false;
                // Add import quick fixes
                if (valueNode) {
                    exposedValues
                        .filter((exposed) => exposed.value === valueNode.text ||
                        ((valueNode.type === "upper_case_qid" ||
                            valueNode.type === "value_qid") &&
                            exposed.value ===
                                valueNode.namedChildren[valueNode.namedChildren.length - 1]
                                    .text &&
                            exposed.module === valueNode.namedChildren[0].text))
                        .forEach((exposed) => {
                        hasImportFix = true;
                        result.push(this.createImportQuickFix(uri, diagnostic, exposed.module, valueNode.type !== "upper_case_qid" &&
                            valueNode.type !== "value_qid"
                            ? exposed.valueToImport
                                ? exposed.valueToImport
                                : exposed.value
                            : undefined));
                    });
                }
                // Add import all quick fix
                const filteredImports = (_b = (_a = this.neededImports
                    .get(uri)) === null || _a === void 0 ? void 0 : _a.filter((data, i, array) => array.findIndex((d) => data.moduleName === d.moduleName &&
                    data.valueName === d.valueName) === i)) !== null && _b !== void 0 ? _b : [];
                if (hasImportFix && filteredImports.length > 1) {
                    // Sort so that the first diagnostic is this one
                    (_c = this.neededImports
                        .get(uri)) === null || _c === void 0 ? void 0 : _c.sort((a, b) => a.diagnostic.message === diagnostic.message
                        ? -1
                        : b.diagnostic.message === diagnostic.message
                            ? 1
                            : 0);
                    result.push(this.createImportAllQuickFix(uri));
                }
            }
            if (diagnostic.message.startsWith(NAMING_ERROR) ||
                diagnostic.message.startsWith("BAD IMPORT") ||
                diagnostic.message.startsWith("UNKNOWN LICENSE") ||
                diagnostic.message.startsWith("UNKNOWN PACKAGE") ||
                diagnostic.message.startsWith("UNKNOWN EXPORT")) {
                // Offer the name suggestions from elm make to our users
                const regex = /^\s{4}#(.*)#$/gm;
                let matches;
                // tslint:disable-next-line: no-conditional-assignment
                while ((matches = regex.exec(diagnostic.message)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (matches.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    matches
                        .filter((_, groupIndex) => groupIndex === 1)
                        .forEach((match, _) => {
                        result.push(this.createQuickFix(uri, match, diagnostic));
                    });
                }
            }
            else if (diagnostic.message.startsWith("MODULE NAME MISMATCH") ||
                diagnostic.message.startsWith("UNEXPECTED SYMBOL")) {
                // Offer the name suggestions from elm make to our users
                const regex = /# -> #(.*)#$/gm;
                const matches = regex.exec(diagnostic.message);
                if (matches !== null) {
                    result.push(this.createQuickFix(uri, matches[1], diagnostic));
                }
            }
        });
        return result;
    }
    createQuickFix(uri, replaceWith, diagnostic) {
        const map = {};
        if (!map[uri]) {
            map[uri] = [];
        }
        map[uri].push(vscode_languageserver_1.TextEdit.replace(diagnostic.range, replaceWith));
        return {
            diagnostics: [diagnostic],
            edit: { changes: map },
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            title: `Change to \`${replaceWith}\``,
        };
    }
    createImportQuickFix(uri, diagnostic, moduleName, nameToImport) {
        const changes = {};
        if (!changes[uri]) {
            changes[uri] = [];
        }
        const tree = this.elmWorkspaceMatcher
            .getElmWorkspaceFor(vscode_uri_1.URI.parse(uri))
            .getForest()
            .getTree(uri);
        if (tree) {
            const edit = refactorEditUtils_1.RefactorEditUtils.addImport(tree, moduleName, nameToImport);
            if (edit) {
                changes[uri].push(edit);
            }
        }
        return {
            diagnostics: [diagnostic],
            edit: { changes },
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            title: nameToImport
                ? `Import '${nameToImport}' from module "${moduleName}"`
                : `Import module "${moduleName}"`,
            isPreferred: true,
        };
    }
    createImportAllQuickFix(uri) {
        const changes = {};
        if (!changes[uri]) {
            changes[uri] = [];
        }
        const tree = this.elmWorkspaceMatcher
            .getElmWorkspaceFor(vscode_uri_1.URI.parse(uri))
            .getForest()
            .getTree(uri);
        const imports = this.neededImports.get(uri);
        if (tree && imports) {
            const edit = refactorEditUtils_1.RefactorEditUtils.addImports(tree, imports);
            if (edit) {
                changes[uri].push(edit);
            }
        }
        return {
            diagnostics: imports === null || imports === void 0 ? void 0 : imports.map((data) => data.diagnostic),
            edit: { changes },
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            title: `Add all missing imports`,
        };
    }
    filterElmMakeDiagnostics(diagnostics) {
        return diagnostics.filter((diagnostic) => diagnostic.source === ELM_MAKE);
    }
    checkForErrors(cwd, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = yield this.settings.getClientSettings();
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const relativePathToFile = path.relative(cwd, filename);
                const argsMake = [
                    "make",
                    relativePathToFile,
                    "--report",
                    "json",
                    "--output",
                    "/dev/null",
                ];
                const argsTest = [
                    "make",
                    relativePathToFile,
                    "--report",
                    "json",
                    "--output",
                    "/dev/null",
                ];
                const makeCommand = settings.elmPath;
                const testCommand = settings.elmTestPath;
                const isTestFile = utils.isTestFile(filename, cwd);
                const args = isTestFile ? argsTest : argsMake;
                const testOrMakeCommand = isTestFile ? testCommand : makeCommand;
                const testOrMakeCommandWithOmittedSettings = isTestFile
                    ? "elm-test"
                    : "elm";
                const options = {
                    cmdArguments: args,
                    notFoundText: isTestFile
                        ? "'elm-test' is not available. Install Elm via 'npm install -g elm-test'."
                        : "The 'elm' compiler is not available. Install Elm via 'npm install -g elm'.",
                };
                try {
                    // Do nothing on success, but return that there were no errors
                    yield elmUtils_1.execCmd(testOrMakeCommand, testOrMakeCommandWithOmittedSettings, options, cwd, this.connection);
                    resolve([]);
                }
                catch (error) {
                    if (typeof error === "string") {
                        resolve([]);
                    }
                    else {
                        const execaError = error;
                        const lines = [];
                        execaError.stderr.split("\n").forEach((line) => {
                            let errorObject;
                            try {
                                errorObject = JSON.parse(line);
                            }
                            catch (error) {
                                this.connection.console.warn("Received an invalid json, skipping error.");
                            }
                            if (errorObject && errorObject.type === "compile-errors") {
                                errorObject.errors.forEach((error) => {
                                    const problems = error.problems.map((problem) => ({
                                        details: problem.message
                                            .map((message) => typeof message === "string"
                                            ? message
                                            : `#${message.string}#`)
                                            .join(""),
                                        file: error.path
                                            ? path.isAbsolute(error.path)
                                                ? path.relative(cwd, error.path)
                                                : error.path
                                            : relativePathToFile,
                                        overview: problem.title,
                                        region: problem.region,
                                        subregion: "",
                                        tag: "error",
                                        type: "error",
                                    }));
                                    lines.push(...problems);
                                });
                            }
                            else if (errorObject && errorObject.type === "error") {
                                const problem = {
                                    details: errorObject.message
                                        .map((message) => typeof message === "string" ? message : message.string)
                                        .join(""),
                                    // elm-test might supply absolute paths to files
                                    file: errorObject.path
                                        ? path.relative(cwd, errorObject.path)
                                        : relativePathToFile,
                                    overview: errorObject.title,
                                    region: {
                                        end: {
                                            column: 1,
                                            line: 1,
                                        },
                                        start: {
                                            column: 1,
                                            line: 1,
                                        },
                                    },
                                    subregion: "",
                                    tag: "error",
                                    type: "error",
                                };
                                lines.push(problem);
                            }
                        });
                        resolve(lines);
                    }
                }
            }));
        });
    }
}
exports.ElmMakeDiagnostics = ElmMakeDiagnostics;
//# sourceMappingURL=elmMakeDiagnostics.js.map