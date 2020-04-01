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
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const elmWorkspaceMatcher_1 = require("../../util/elmWorkspaceMatcher");
const noWorkspaceContainsError_1 = require("../../util/noWorkspaceContainsError");
class DiagnosticsProvider {
    constructor(connection, elmWorkspaces, settings, events, elmAnalyse, elmMake) {
        this.connection = connection;
        this.settings = settings;
        this.events = events;
        this.newElmAnalyseDiagnostics = this.newElmAnalyseDiagnostics.bind(this);
        this.elmMakeDiagnostics = elmMake;
        this.elmAnalyseDiagnostics = elmAnalyse;
        this.elmWorkspaceMatcher = new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (doc) => vscode_uri_1.URI.parse(doc.uri));
        this.currentDiagnostics = {
            elmAnalyse: new Map(),
            elmMake: new Map(),
            elmTest: new Map(),
        };
        // register onChange listener if settings are not on-save only
        this.settings.getClientSettings().then(({ elmAnalyseTrigger }) => {
            this.events.on("open", (d) => this.getDiagnostics(d, true, elmAnalyseTrigger));
            this.events.on("save", (d) => this.getDiagnostics(d, true, elmAnalyseTrigger));
            this.connection.onDidChangeWatchedFiles((event) => {
                const newDeleteEvents = event.changes
                    .filter((a) => a.type === vscode_languageserver_1.FileChangeType.Deleted)
                    .map((a) => a.uri);
                newDeleteEvents.forEach((uri) => {
                    this.currentDiagnostics.elmAnalyse.delete(uri);
                    this.currentDiagnostics.elmMake.delete(uri);
                    this.currentDiagnostics.elmTest.delete(uri);
                });
                this.sendDiagnostics();
            });
            if (this.elmAnalyseDiagnostics) {
                this.elmAnalyseDiagnostics.on("new-diagnostics", this.newElmAnalyseDiagnostics);
            }
            if (elmAnalyseTrigger === "change") {
                this.events.on("change", (d) => this.getDiagnostics(d, false, elmAnalyseTrigger));
            }
        });
    }
    newElmAnalyseDiagnostics(diagnostics) {
        this.currentDiagnostics.elmAnalyse = diagnostics;
        this.sendDiagnostics();
    }
    sendDiagnostics() {
        var _a, _b;
        const allDiagnostics = new Map();
        for (const [uri, diagnostics] of this.currentDiagnostics.elmMake) {
            allDiagnostics.set(uri, diagnostics);
        }
        for (const [uri, diagnostics] of this.currentDiagnostics.elmTest) {
            const currentDiagnostics = (_a = allDiagnostics.get(uri)) !== null && _a !== void 0 ? _a : [];
            if (currentDiagnostics.length === 0) {
                allDiagnostics.set(uri, diagnostics);
            }
        }
        for (const [uri, diagnostics] of this.currentDiagnostics.elmAnalyse) {
            const currentDiagnostics = (_b = allDiagnostics.get(uri)) !== null && _b !== void 0 ? _b : [];
            if (currentDiagnostics.length === 0) {
                allDiagnostics.set(uri, diagnostics);
            }
        }
        for (const [uri, diagnostics] of allDiagnostics) {
            this.connection.sendDiagnostics({ uri, diagnostics });
        }
    }
    getDiagnostics({ document }, isSaveOrOpen, elmAnalyseTrigger) {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Diagnostics were requested due to a file ${isSaveOrOpen ? "open or save" : "change"}`);
            const uri = vscode_uri_1.URI.parse(document.uri);
            try {
                this.elmWorkspaceMatcher.getElmWorkspaceFor(document);
            }
            catch (error) {
                if (error instanceof noWorkspaceContainsError_1.NoWorkspaceContainsError) {
                    this.connection.console.info(error.message);
                    return; // ignore file that doesn't correspond to a workspace
                }
                throw error;
            }
            const text = document.getText();
            if (isSaveOrOpen) {
                this.currentDiagnostics.elmMake = yield this.elmMakeDiagnostics.createDiagnostics(uri);
            }
            const elmMakeDiagnosticsForCurrentFile = this.currentDiagnostics.elmMake.get(uri.toString());
            if (this.elmAnalyseDiagnostics &&
                elmAnalyseTrigger !== "never" &&
                (!elmMakeDiagnosticsForCurrentFile ||
                    (elmMakeDiagnosticsForCurrentFile &&
                        elmMakeDiagnosticsForCurrentFile.length === 0))) {
                this.elmAnalyseDiagnostics.updateFile(uri, text);
            }
            this.sendDiagnostics();
        });
    }
}
exports.DiagnosticsProvider = DiagnosticsProvider;
//# sourceMappingURL=diagnosticsProvider.js.map