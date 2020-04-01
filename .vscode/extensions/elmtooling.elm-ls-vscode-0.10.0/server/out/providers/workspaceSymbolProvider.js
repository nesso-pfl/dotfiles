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
const symbolTranslator_1 = require("../util/symbolTranslator");
class WorkspaceSymbolProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.elmWorkspaces = elmWorkspaces;
        this.workspaceSymbolRequest = (param) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Workspace Symbols were requested`);
            const symbolInformationMap = new Map();
            this.elmWorkspaces.forEach((elmWorkspace) => {
                elmWorkspace.getForest().treeIndex.forEach((tree) => {
                    const traverse = (node) => {
                        if (node.text.includes(param.query)) {
                            const symbolInformation = symbolTranslator_1.SymbolInformationTranslator.translateNodeToSymbolInformation(tree.uri, node);
                            if (symbolInformation) {
                                const current = symbolInformationMap.get(tree.uri) || [];
                                symbolInformationMap.set(tree.uri, [
                                    ...current,
                                    symbolInformation,
                                ]);
                            }
                        }
                        for (const childNode of node.children) {
                            traverse(childNode);
                        }
                    };
                    // skip URIs already traversed in a previous Elm workspace
                    if (tree && !symbolInformationMap.get(tree.uri)) {
                        traverse(tree.tree.rootNode);
                    }
                });
            });
            return Array.from(symbolInformationMap.values()).flat();
        });
        this.connection.onWorkspaceSymbol(this.workspaceSymbolRequest);
    }
}
exports.WorkspaceSymbolProvider = WorkspaceSymbolProvider;
//# sourceMappingURL=workspaceSymbolProvider.js.map