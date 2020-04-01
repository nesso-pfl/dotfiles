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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = __importDefault(require("util"));
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const Diff = __importStar(require("../../util/diff"));
const elmWorkspaceMatcher_1 = require("../../util/elmWorkspaceMatcher");
const readFile = util_1.default.promisify(fs.readFile);
const fixableErrors = [
    "UnnecessaryParens",
    "UnusedImport",
    "UnusedImportedVariable",
    "UnusedImportAlias",
    "UnusedPatternVariable",
    "UnusedTypeAlias",
    "MultiLineRecordFormatting",
    "DropConsOfItemAndList",
    "DuplicateImport",
];
const ELM_ANALYSE = "elm-analyse";
const RANDOM_ID = crypto_1.randomBytes(16).toString("hex");
exports.CODE_ACTION_ELM_ANALYSE = `elmLS.elmAnalyseFixer-${RANDOM_ID}`;
exports.CODE_ACTION_ELM_ANALYSE_FIX_ALL = `elmLS.elmAnalyseFixer.fixAll-${RANDOM_ID}`;
class ElmAnalyseDiagnostics {
    constructor(connection, elmWorkspaces, events, settings, formattingProvider) {
        this.connection = connection;
        this.events = events;
        this.settings = settings;
        this.formattingProvider = formattingProvider;
        this.filesWithDiagnostics = new Set();
        this.eventEmitter = new events_1.EventEmitter();
        this.onNewReportForWorkspace = (elmWorkspace) => (report) => {
            this.connection.console.info(`Received new elm-analyse report with ${report.messages.length} messages`);
            // When publishing diagnostics it looks like you have to publish
            // for one URI at a time, so this groups all of the messages for
            // each file and sends them as a batch
            this.diagnostics = report.messages.reduce((acc, message) => {
                var _a;
                const uri = vscode_uri_1.URI.file(path.join(elmWorkspace.getRootPath().fsPath, message.file)).toString();
                const arr = (_a = acc.get(uri)) !== null && _a !== void 0 ? _a : [];
                arr.push(this.messageToDiagnostic(message));
                acc.set(uri, arr);
                return acc;
            }, new Map());
            const filesInReport = new Set(this.diagnostics.keys());
            const filesThatAreNowFixed = new Set([...this.filesWithDiagnostics].filter((uriPath) => !filesInReport.has(uriPath)));
            this.filesWithDiagnostics = filesInReport;
            // When you fix the last error in a file it no longer shows up in the report, but
            // we still need to clear the error marker for it
            filesThatAreNowFixed.forEach((file) => this.diagnostics.set(file, []));
            this.eventEmitter.emit("new-diagnostics", this.diagnostics);
        };
        this.onExecuteCommand = this.onExecuteCommand.bind(this);
        this.onCodeAction = this.onCodeAction.bind(this);
        this.diagnostics = new Map();
        this.elmWorkspaceMatcher = new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (uri) => uri);
        this.elmAnalysers = new Map(elmWorkspaces.map((ws) => [ws, this.setupElmAnalyse(ws)]));
    }
    on(event, listener) {
        this.eventEmitter.on(event, listener);
        return this;
    }
    updateFile(uri, text) {
        const workspace = this.elmWorkspaceMatcher.getElmWorkspaceFor(uri);
        const analyser = this.elmAnalysers.get(workspace);
        if (!analyser) {
            throw new Error(`No elm-analyse instance loaded for workspace ${uri}.`);
        }
        analyser.then((elmAnalyser) => {
            elmAnalyser.ports.fileWatch.send({
                content: text !== null && text !== void 0 ? text : null,
                event: "update",
                file: path.relative(workspace.getRootPath().fsPath, uri.fsPath),
            });
        });
    }
    onCodeAction(params) {
        var _a;
        const { uri } = params.textDocument;
        // The `CodeActionParams` will only have diagnostics for the region we were in, for the
        // "Fix All" feature we need to know about all of the fixable things in the document
        const fixableDiagnostics = this.fixableDiagnostics((_a = this.diagnostics.get(uri.toString())) !== null && _a !== void 0 ? _a : []);
        const fixAllInFile = fixableDiagnostics.length > 1
            ? [
                {
                    command: {
                        arguments: [uri],
                        command: exports.CODE_ACTION_ELM_ANALYSE_FIX_ALL,
                        title: `Fix all ${fixableDiagnostics.length} issues`,
                    },
                    diagnostics: fixableDiagnostics,
                    kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                    title: `Fix all ${fixableDiagnostics.length} issues`,
                },
            ]
            : [];
        const contextDiagnostics = this.fixableDiagnostics(params.context.diagnostics).map((diagnostic) => {
            const title = diagnostic.message.split("\n")[0];
            return {
                command: {
                    arguments: [uri, diagnostic],
                    command: exports.CODE_ACTION_ELM_ANALYSE,
                    title,
                },
                diagnostics: [diagnostic],
                kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                title,
            };
        });
        return contextDiagnostics.length > 0
            ? contextDiagnostics.concat(fixAllInFile)
            : [];
    }
    onExecuteCommand(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let uri;
            switch (params.command) {
                case exports.CODE_ACTION_ELM_ANALYSE:
                    if (!params.arguments || params.arguments.length !== 2) {
                        this.connection.console.warn("Received incorrect number of arguments for elm-analyse fixer. Returning early.");
                        return;
                    }
                    uri = params.arguments[0];
                    const diagnostic = params.arguments[1];
                    const code = typeof diagnostic.code === "number" ? diagnostic.code : -1;
                    if (code === -1) {
                        this.connection.console.warn("Unable to apply elm-analyse fix, unknown diagnostic code");
                        return;
                    }
                    return this.fixer(uri, code);
                case exports.CODE_ACTION_ELM_ANALYSE_FIX_ALL:
                    if (!params.arguments || params.arguments.length !== 1) {
                        this.connection.console.warn("Received incorrect number of arguments for elm-analyse fixer. Returning early.");
                        return;
                    }
                    uri = params.arguments[0];
                    return this.fixer(uri);
            }
        });
    }
    fixableDiagnostics(diagnostics) {
        return diagnostics.filter((diagnostic) => diagnostic.source === ELM_ANALYSE && this.isFixable(diagnostic));
    }
    /**
     * If a diagnosticId is provided it will fix the single issue, if no
     * id is provided it will fix the entire file.
     */
    fixer(uri, diagnosticId) {
        return __awaiter(this, void 0, void 0, function* () {
            const elmWorkspace = this.elmWorkspaceMatcher.getElmWorkspaceFor(uri);
            const edits = yield this.getFixEdits(elmWorkspace, uri, diagnosticId);
            return this.connection.workspace.applyEdit({
                changes: {
                    [uri.toString()]: edits,
                },
            });
        });
    }
    getFixEdits(elmWorkspace, uri, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const elmAnalyse = yield this.elmAnalysers.get(elmWorkspace);
            const settings = yield this.settings.getClientSettings();
            if (!elmAnalyse) {
                throw new Error(`No elm-analyse instance loaded for workspace ${uri}.`);
            }
            const filePath = vscode_uri_1.URI.parse(uri.toString()).fsPath;
            const relativePath = path.relative(elmWorkspace.getRootPath().fsPath, filePath);
            return new Promise((resolve, reject) => {
                // Naming the function here so that we can unsubscribe once we get the new file content
                const onFixComplete = (fixedFile) => {
                    this.connection.console.info(`Received fixed file from elm-analyse for path: ${filePath}`);
                    elmAnalyse.ports.sendFixedFile.unsubscribe(onFixComplete);
                    const oldText = this.events.get(uri.toString());
                    if (!oldText) {
                        return reject("Unable to apply elm-analyse fix, file content was unavailable.");
                    }
                    // This formats the fixed file with elm-format first and then figures out the
                    // diffs from there, this prevents needing to chain sets of edits
                    resolve(this.formattingProvider
                        .formatText(elmWorkspace.getRootPath(), settings.elmFormatPath, fixedFile.content)
                        .then((elmFormatEdits) => __awaiter(this, void 0, void 0, function* () {
                        return yield this.createEdits(oldText.getText(), fixedFile.content, elmFormatEdits);
                    })));
                };
                elmAnalyse.ports.sendFixedFile.subscribe(onFixComplete);
                if (typeof code === "number") {
                    this.connection.console.info(`Sending elm-analyse fix request for diagnostic id: ${code}`);
                    elmAnalyse.ports.onFixQuick.send(code);
                }
                else {
                    this.connection.console.info(`Sending elm-analyse fix request for file: ${relativePath}`);
                    elmAnalyse.ports.onFixFileQuick.send(relativePath);
                }
            });
        });
    }
    createEdits(oldText, newText, elmFormatEdits) {
        return __awaiter(this, void 0, void 0, function* () {
            if (elmFormatEdits) {
                // Fake a `TextDocument` so that we can use `applyEdits` on `TextDocument`
                const formattedFile = vscode_languageserver_textdocument_1.TextDocument.create("file://fakefile.elm", "elm", 0, newText);
                return Diff.getTextRangeChanges(oldText, vscode_languageserver_textdocument_1.TextDocument.applyEdits(formattedFile, elmFormatEdits));
            }
            else {
                return Diff.getTextRangeChanges(oldText, newText);
            }
        });
    }
    setupElmAnalyse(elmWorkspace) {
        return __awaiter(this, void 0, void 0, function* () {
            const fsPath = elmWorkspace.getRootPath().fsPath;
            const elmJson = yield readFile(path.join(fsPath, "elm.json"), {
                encoding: "utf-8",
            }).then(JSON.parse);
            const fileLoadingPorts = require("elm-analyse/dist/app/file-loading-ports.js");
            const { Elm } = require("elm-analyse/dist/app/backend-elm.js");
            const elmAnalyse = Elm.Analyser.init({
                flags: {
                    project: elmJson,
                    registry: [],
                    server: false,
                },
            });
            // elm-analyse breaks if there is a trailing slash on the path, it tries to
            // read <dir>//elm.json instead of <div>/elm.json
            fileLoadingPorts.setup(elmAnalyse, {}, fsPath.replace(/[\\/]?$/, ""));
            return new Promise((resolve) => {
                // Wait for elm-analyse to send back the first report
                const cb = (firstReport) => {
                    elmAnalyse.ports.sendReportValue.unsubscribe(cb);
                    const onNewReport = this.onNewReportForWorkspace(elmWorkspace);
                    onNewReport(firstReport);
                    elmAnalyse.ports.sendReportValue.subscribe(onNewReport);
                    resolve(elmAnalyse);
                };
                elmAnalyse.ports.sendReportValue.subscribe(cb);
            });
        });
    }
    isFixable(diagnostic) {
        return fixableErrors.some((e) => diagnostic.message.indexOf(e) > -1);
    }
    messageToDiagnostic(message) {
        var _a;
        if (message.type === "FileLoadFailed") {
            return {
                code: "1",
                message: "Error parsing file",
                range: {
                    end: { line: 1, character: 0 },
                    start: { line: 0, character: 0 },
                },
                severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                source: ELM_ANALYSE,
            };
        }
        const rangeDefaults = [1, 1, 2, 1];
        const [lineStart, colStart, lineEnd, colEnd] = (_a = (message.data &&
            message.data.properties &&
            message.data.properties.range)) !== null && _a !== void 0 ? _a : rangeDefaults;
        const range = {
            end: { line: lineEnd - 1, character: colEnd - 1 },
            start: { line: lineStart - 1, character: colStart - 1 },
        };
        return {
            code: message.id,
            // Clean up the error message a bit, removing the end of the line, e.g.
            // "Record has only one field. Use the field's type or introduce a Type. At ((14,5),(14,20))"
            message: `${message.data.description.split(/at .+$/i)[0]}\nSee https://stil4m.github.io/elm-analyse/#/messages/${message.type}`,
            range,
            severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
            source: ELM_ANALYSE,
            tags: message.data.description.startsWith("Unused ")
                ? [vscode_languageserver_1.DiagnosticTag.Unnecessary]
                : undefined,
        };
    }
}
exports.ElmAnalyseDiagnostics = ElmAnalyseDiagnostics;
//# sourceMappingURL=elmAnalyseDiagnostics.js.map