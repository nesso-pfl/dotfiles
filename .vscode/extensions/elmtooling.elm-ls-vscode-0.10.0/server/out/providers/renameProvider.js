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
class RenameProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.handleRenameRequest = (params, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Renaming was requested`);
            const affectedNodes = this.getRenameAffectedNodes(elmWorkspace, params.textDocument.uri, params.position);
            const map = {};
            affectedNodes === null || affectedNodes === void 0 ? void 0 : affectedNodes.references.forEach((a) => {
                if (!map[a.uri]) {
                    map[a.uri] = [];
                }
                map[a.uri].push(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(a.node.startPosition.row, a.node.startPosition.column), vscode_languageserver_1.Position.create(a.node.endPosition.row, a.node.endPosition.column)), params.newName));
            });
            if (map) {
                return {
                    changes: map,
                };
            }
        });
        this.handlePrepareRenameRequest = (params, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Prepare rename was requested`);
            const affectedNodes = this.getRenameAffectedNodes(elmWorkspace, params.textDocument.uri, params.position);
            if (affectedNodes === null || affectedNodes === void 0 ? void 0 : affectedNodes.references.length) {
                const node = affectedNodes.originalNode;
                return vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(node.startPosition.row, node.startPosition.column), vscode_languageserver_1.Position.create(node.endPosition.row, node.endPosition.column));
            }
            return null;
        });
        this.connection.onPrepareRename(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (params) => vscode_uri_1.URI.parse(params.textDocument.uri)).handlerForWorkspace(this.handlePrepareRenameRequest));
        this.connection.onRenameRequest(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (params) => vscode_uri_1.URI.parse(params.textDocument.uri)).handlerForWorkspace(this.handleRenameRequest));
    }
    getRenameAffectedNodes(elmWorkspace, uri, position) {
        const imports = elmWorkspace.getImports();
        const forest = elmWorkspace.getForest();
        const tree = forest.getTree(uri);
        if (tree) {
            const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, position);
            const definitionNode = treeUtils_1.TreeUtils.findDefinitionNodeByReferencingNode(nodeAtPosition, uri, tree, imports);
            if (definitionNode) {
                const refTree = forest.getByUri(definitionNode.uri);
                if (refTree && refTree.writeable) {
                    return {
                        originalNode: nodeAtPosition,
                        references: references_1.References.find(definitionNode, forest, imports),
                    };
                }
                if (refTree && !refTree.writeable) {
                    throw new vscode_languageserver_1.ResponseError(1, "Can not rename, due to source being outside of you project.");
                }
            }
        }
    }
}
exports.RenameProvider = RenameProvider;
//# sourceMappingURL=renameProvider.js.map