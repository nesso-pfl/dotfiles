"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const ElmAnalyseDiagnostics = __importStar(require("./providers/diagnostics/elmAnalyseDiagnostics"));
const ElmMakeDiagnostics = __importStar(require("./providers/diagnostics/elmMakeDiagnostics"));
class CapabilityCalculator {
    constructor(clientCapabilities) {
        this.clientCapabilities = clientCapabilities;
    }
    get capabilities() {
        // tslint:disable-next-line:no-unused-expression
        this.clientCapabilities;
        return {
            codeActionProvider: true,
            codeLensProvider: {
                resolveProvider: true,
            },
            completionProvider: {
                triggerCharacters: ["."],
            },
            definitionProvider: true,
            documentFormattingProvider: true,
            documentSymbolProvider: true,
            executeCommandProvider: {
                commands: [
                    ElmAnalyseDiagnostics.CODE_ACTION_ELM_ANALYSE,
                    ElmAnalyseDiagnostics.CODE_ACTION_ELM_ANALYSE_FIX_ALL,
                    ElmMakeDiagnostics.CODE_ACTION_ELM_MAKE,
                ],
            },
            foldingRangeProvider: true,
            hoverProvider: true,
            referencesProvider: true,
            renameProvider: true,
            selectionRangeProvider: true,
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Full,
            workspaceSymbolProvider: true,
        };
    }
}
exports.CapabilityCalculator = CapabilityCalculator;
//# sourceMappingURL=capabilityCalculator.js.map