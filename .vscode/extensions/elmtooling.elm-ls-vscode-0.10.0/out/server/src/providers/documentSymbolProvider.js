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
const vscode_uri_1 = require("vscode-uri");
const elmWorkspaceMatcher_1 = require("../util/elmWorkspaceMatcher");
const symbolTranslator_1 = require("../util/symbolTranslator");
class DocumentSymbolProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.handleDocumentSymbolRequest = (param, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Document Symbols were requested`);
            const symbolInformationList = [];
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(param.textDocument.uri);
            const traverse = (node) => {
                const symbolInformation = symbolTranslator_1.SymbolInformationTranslator.translateNodeToSymbolInformation(param.textDocument.uri, node);
                if (symbolInformation) {
                    symbolInformationList.push(symbolInformation);
                }
                for (const childNode of node.children) {
                    traverse(childNode);
                }
            };
            if (tree) {
                traverse(tree.rootNode);
            }
            return symbolInformationList;
        });
        connection.onDocumentSymbol(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.handleDocumentSymbolRequest));
    }
}
exports.DocumentSymbolProvider = DocumentSymbolProvider;
//# sourceMappingURL=documentSymbolProvider.js.map