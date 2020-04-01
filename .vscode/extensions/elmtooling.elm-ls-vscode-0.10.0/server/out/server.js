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
Object.defineProperty(exports, "__esModule", { value: true });
const globby_1 = __importDefault(require("globby"));
const path_1 = __importDefault(require("path"));
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const capabilityCalculator_1 = require("./capabilityCalculator");
const elmWorkspace_1 = require("./elmWorkspace");
const providers_1 = require("./providers");
const documentEvents_1 = require("./util/documentEvents");
const settings_1 = require("./util/settings");
const textDocumentEvents_1 = require("./util/textDocumentEvents");
class Server {
    constructor(connection, params, parser, progress) {
        var _a;
        this.connection = connection;
        this.params = params;
        this.parser = parser;
        this.progress = progress;
        this.elmWorkspaces = [];
        this.calculator = new capabilityCalculator_1.CapabilityCalculator(params.capabilities);
        const initializationOptions = (_a = this.params.initializationOptions) !== null && _a !== void 0 ? _a : {};
        this.settings = new settings_1.Settings(this.connection, initializationOptions, params.capabilities);
        const uri = this.getWorkspaceUri(params);
        if (uri) {
            // Cleanup the path on windows, as globby does not like backslashes
            const globUri = uri.fsPath.replace(/\\/g, "/");
            const elmJsonGlob = `${globUri}/**/elm.json`;
            const elmJsons = globby_1.default.sync([elmJsonGlob, "!**/node_modules/**", "!**/elm-stuff/**"], { suppressErrors: true });
            if (elmJsons.length > 0) {
                connection.console.info(`Found ${elmJsons.length} elm.json files for workspace ${globUri}`);
                const listOfElmJsonFolders = elmJsons.map((a) => this.getElmJsonFolder(a));
                const topLevelElmJsons = this.findTopLevelFolders(listOfElmJsonFolders);
                connection.console.info(`Found ${topLevelElmJsons.size} unique elmWorkspaces for workspace ${globUri}`);
                topLevelElmJsons.forEach((elmWorkspace) => {
                    this.elmWorkspaces.push(new elmWorkspace_1.ElmWorkspace(elmWorkspace, connection, this.settings, this.parser));
                });
            }
            else {
                this.connection.window.showErrorMessage("No elm.json found. Please run 'elm init' in your main directory.");
                this.connection.console.info(`No elm.json found`);
            }
        }
        else {
            this.connection.console.info(`No workspace was setup by the client`);
        }
    }
    get capabilities() {
        return {
            capabilities: this.calculator.capabilities,
        };
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.progress.begin("Indexing Elm", 0);
            yield Promise.all(this.elmWorkspaces
                .map((ws) => ({ ws, indexedPercent: 0 }))
                .map((indexingWs, _, all) => indexingWs.ws.init((percent) => {
                // update progress for this workspace
                indexingWs.indexedPercent = percent;
                // report average progress across all workspaces
                const avgIndexed = all.reduce((sum, { indexedPercent }) => sum + indexedPercent, 0) /
                    all.length;
                this.progress.report(avgIndexed, `${Math.round(avgIndexed)}%`);
            })));
            this.progress.done();
        });
    }
    registerInitializedProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            // We can now query the client for up to date settings
            this.settings.initFinished();
            const documentEvents = new documentEvents_1.DocumentEvents(this.connection);
            const textDocumentEvents = new textDocumentEvents_1.TextDocumentEvents(vscode_languageserver_textdocument_1.TextDocument, documentEvents);
            const settings = yield this.settings.getClientSettings();
            const documentFormattingProvider = new providers_1.DocumentFormattingProvider(this.connection, this.elmWorkspaces, textDocumentEvents, this.settings);
            const elmAnalyse = settings.elmAnalyseTrigger !== "never"
                ? new providers_1.ElmAnalyseDiagnostics(this.connection, this.elmWorkspaces, textDocumentEvents, this.settings, documentFormattingProvider)
                : null;
            const elmMake = new providers_1.ElmMakeDiagnostics(this.connection, this.elmWorkspaces, this.settings);
            // tslint:disable:no-unused-expression
            new providers_1.DiagnosticsProvider(this.connection, this.elmWorkspaces, this.settings, textDocumentEvents, elmAnalyse, elmMake);
            new providers_1.CodeActionProvider(this.connection, this.elmWorkspaces, this.settings, elmAnalyse, elmMake);
            // tslint:disable:no-unused-expression
            new providers_1.ASTProvider(this.connection, this.elmWorkspaces, documentEvents, this.parser);
            new providers_1.FoldingRangeProvider(this.connection, this.elmWorkspaces);
            new providers_1.CompletionProvider(this.connection, this.elmWorkspaces);
            new providers_1.HoverProvider(this.connection, this.elmWorkspaces);
            new providers_1.DefinitionProvider(this.connection, this.elmWorkspaces);
            new providers_1.ReferencesProvider(this.connection, this.elmWorkspaces);
            new providers_1.DocumentSymbolProvider(this.connection, this.elmWorkspaces);
            new providers_1.WorkspaceSymbolProvider(this.connection, this.elmWorkspaces);
            new providers_1.CodeLensProvider(this.connection, this.elmWorkspaces, this.settings);
            new providers_1.SelectionRangeProvider(this.connection, this.elmWorkspaces);
            new providers_1.RenameProvider(this.connection, this.elmWorkspaces);
        });
    }
    getElmJsonFolder(uri) {
        return vscode_uri_1.URI.file(path_1.default.dirname(uri));
    }
    findTopLevelFolders(listOfElmJsonFolders) {
        const result = new Map();
        listOfElmJsonFolders.forEach((element) => {
            result.set(element.toString(), element);
        });
        listOfElmJsonFolders.forEach((a) => {
            listOfElmJsonFolders.forEach((b) => {
                if (b.toString() !== a.toString() &&
                    b.toString().startsWith(a.toString())) {
                    result.delete(b.toString());
                }
            });
        });
        return result;
    }
    getWorkspaceUri(params) {
        if (params.rootUri) {
            return vscode_uri_1.URI.parse(params.rootUri);
        }
        else if (params.rootPath) {
            return vscode_uri_1.URI.file(params.rootPath);
        }
        else {
            return null;
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map