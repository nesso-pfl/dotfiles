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
const elmWorkspaceMatcher_1 = require("../util/elmWorkspaceMatcher");
const treeUtils_1 = require("../util/treeUtils");
class DefinitionProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.handleDefinitionRequest = (param, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`A definition was requested`);
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(param.textDocument.uri);
            if (tree) {
                const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, param.position);
                const definitionNode = treeUtils_1.TreeUtils.findDefinitionNodeByReferencingNode(nodeAtPosition, param.textDocument.uri, tree, elmWorkspace.getImports());
                if (definitionNode) {
                    return this.createLocationFromDefinition(definitionNode.node, definitionNode.uri);
                }
            }
        });
        this.connection.onDefinition(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.handleDefinitionRequest));
    }
    createLocationFromDefinition(definitionNode, uri) {
        if (definitionNode) {
            return vscode_languageserver_1.Location.create(uri, vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(definitionNode.startPosition.row, definitionNode.startPosition.column), vscode_languageserver_1.Position.create(definitionNode.endPosition.row, definitionNode.endPosition.column)));
        }
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map