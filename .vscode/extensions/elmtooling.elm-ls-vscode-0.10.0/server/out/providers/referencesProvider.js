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
const references_1 = require("../util/references");
const treeUtils_1 = require("../util/treeUtils");
class ReferencesProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.handleReferencesRequest = (params, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`References were requested`);
            const imports = elmWorkspace.getImports();
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(params.textDocument.uri);
            if (tree) {
                const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, params.position);
                const definitionNode = treeUtils_1.TreeUtils.findDefinitionNodeByReferencingNode(nodeAtPosition, params.textDocument.uri, tree, imports);
                const references = references_1.References.find(definitionNode, forest, imports);
                if (references) {
                    return references.map((a) => vscode_languageserver_1.Location.create(a.uri, vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(a.node.startPosition.row, a.node.startPosition.column), vscode_languageserver_1.Position.create(a.node.endPosition.row, a.node.endPosition.column))));
                }
            }
            return undefined;
        });
        this.connection.onReferences(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.handleReferencesRequest));
    }
}
exports.ReferencesProvider = ReferencesProvider;
//# sourceMappingURL=referencesProvider.js.map