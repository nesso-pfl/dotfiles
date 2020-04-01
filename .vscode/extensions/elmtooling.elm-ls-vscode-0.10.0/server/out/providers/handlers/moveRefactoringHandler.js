"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const protocol_1 = require("../../protocol");
const elmWorkspaceMatcher_1 = require("../../util/elmWorkspaceMatcher");
const refactorEditUtils_1 = require("../../util/refactorEditUtils");
const references_1 = require("../../util/references");
const treeUtils_1 = require("../../util/treeUtils");
class MoveRefactoringHandler {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.elmWorkspaces = elmWorkspaces;
        this.connection.onRequest(protocol_1.GetMoveDestinationRequest, new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.sourceUri)).handlerForWorkspace(this.handleGetMoveDestinationsRequest.bind(this)));
        this.connection.onRequest(protocol_1.MoveRequest, new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.sourceUri)).handlerForWorkspace(this.handleMoveRequest.bind(this)));
    }
    handleGetMoveDestinationsRequest(params, elmWorkspace) {
        const forest = elmWorkspace.getForest();
        const destinations = forest.treeIndex
            .filter((tree) => tree.writeable && tree.uri !== params.sourceUri)
            .map((tree) => {
            let uri = vscode_uri_1.URI.parse(tree.uri).fsPath;
            const rootPath = elmWorkspace.getRootPath().fsPath;
            uri = uri.slice(rootPath.length + 1);
            const index = uri.lastIndexOf("\\");
            return {
                name: uri.slice(index + 1),
                path: uri.slice(0, index),
                uri: tree.uri,
            };
        });
        return {
            destinations,
        };
    }
    handleMoveRequest(params, elmWorkspace) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        if (!params.destination) {
            return;
        }
        const forest = elmWorkspace.getForest();
        const imports = elmWorkspace.getImports();
        const tree = forest.getTree(params.sourceUri);
        const destinationTree = forest.getTree(params.destination.uri);
        if (tree && destinationTree) {
            const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, params.params.range.start);
            const isTypeNode = ((_a = nodeAtPosition.parent) === null || _a === void 0 ? void 0 : _a.type) === "type_annotation";
            const isDeclarationNode = ((_c = (_b = nodeAtPosition.parent) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.type) === "value_declaration";
            const typeNode = isDeclarationNode
                ? ((_f = (_e = (_d = nodeAtPosition.parent) === null || _d === void 0 ? void 0 : _d.parent) === null || _e === void 0 ? void 0 : _e.previousNamedSibling) === null || _f === void 0 ? void 0 : _f.type) ===
                    "type_annotation"
                    ? (_h = (_g = nodeAtPosition.parent) === null || _g === void 0 ? void 0 : _g.parent) === null || _h === void 0 ? void 0 : _h.previousNamedSibling : undefined
                : isTypeNode
                    ? nodeAtPosition.parent
                    : undefined;
            const declarationNode = isDeclarationNode
                ? (_j = nodeAtPosition.parent) === null || _j === void 0 ? void 0 : _j.parent : isTypeNode
                ? (_k = nodeAtPosition.parent) === null || _k === void 0 ? void 0 : _k.nextNamedSibling : undefined;
            const commentNode = ((_l = typeNode === null || typeNode === void 0 ? void 0 : typeNode.previousNamedSibling) === null || _l === void 0 ? void 0 : _l.type) === "block_comment"
                ? typeNode.previousNamedSibling
                : ((_m = declarationNode === null || declarationNode === void 0 ? void 0 : declarationNode.previousNamedSibling) === null || _m === void 0 ? void 0 : _m.type) === "block_comment"
                    ? declarationNode.previousNamedSibling
                    : undefined;
            const functionName = nodeAtPosition.text;
            const moduleName = (_o = treeUtils_1.TreeUtils.getModuleNameNode(tree)) === null || _o === void 0 ? void 0 : _o.text;
            const destinationModuleName = (_p = treeUtils_1.TreeUtils.getModuleNameNode(destinationTree)) === null || _p === void 0 ? void 0 : _p.text;
            if (declarationNode &&
                functionName &&
                moduleName &&
                destinationModuleName) {
                const startPosition = (_r = (_q = commentNode === null || commentNode === void 0 ? void 0 : commentNode.startPosition) !== null && _q !== void 0 ? _q : typeNode === null || typeNode === void 0 ? void 0 : typeNode.startPosition) !== null && _r !== void 0 ? _r : declarationNode.startPosition;
                const endPosition = declarationNode.endPosition;
                const comment = commentNode ? `${commentNode.text}\n` : "";
                const type = typeNode ? `${typeNode.text}\n` : "";
                const functionText = `\n\n${comment}${type}${declarationNode.text}`;
                const changes = {};
                changes[params.sourceUri] = [];
                changes[params.destination.uri] = [];
                // Remove from source
                changes[params.sourceUri].push(vscode_languageserver_1.TextEdit.del(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(startPosition.row, startPosition.column), vscode_languageserver_1.Position.create(endPosition.row, endPosition.column))));
                // Add to destination
                changes[params.destination.uri].push(vscode_languageserver_1.TextEdit.insert(vscode_languageserver_1.Position.create(destinationTree.rootNode.endPosition.row + 1, 0), functionText));
                // Update references
                const references = references_1.References.find({
                    node: declarationNode,
                    nodeType: "Function",
                    uri: params.sourceUri,
                }, forest, imports).map((ref) => {
                    return Object.assign(Object.assign({}, ref), { fullyQualified: treeUtils_1.TreeUtils.isReferenceFullyQualified(ref.node) });
                });
                const sourceHasReference = !!references.find((ref) => {
                    var _a, _b, _c;
                    return ref.uri === params.sourceUri &&
                        ((_a = ref.node.parent) === null || _a === void 0 ? void 0 : _a.text) !== (typeNode === null || typeNode === void 0 ? void 0 : typeNode.text) &&
                        ((_c = (_b = ref.node.parent) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.text) !== (declarationNode === null || declarationNode === void 0 ? void 0 : declarationNode.text) &&
                        ref.node.type !== "exposed_value";
                });
                const referenceUris = new Set(references.map((ref) => ref.uri));
                // Unexpose function in the source file if it is
                const unexposeEdit = refactorEditUtils_1.RefactorEditUtils.unexposedValueInModule(tree, functionName);
                if (unexposeEdit) {
                    changes[params.sourceUri].push(unexposeEdit);
                }
                // Remove old imports to the old source file from all reference uris
                referenceUris.forEach((refUri) => {
                    var _a;
                    if (!changes[refUri]) {
                        changes[refUri] = [];
                    }
                    const refTree = forest.getTree(refUri);
                    if (refTree && ((_a = params.destination) === null || _a === void 0 ? void 0 : _a.name)) {
                        const removeImportEdit = refactorEditUtils_1.RefactorEditUtils.removeValueFromImport(refTree, moduleName, functionName);
                        if (removeImportEdit) {
                            changes[refUri].push(removeImportEdit);
                        }
                    }
                });
                // Expose function in destination file if there are external references
                if (references.filter((ref) => { var _a; return ref.uri !== ((_a = params.destination) === null || _a === void 0 ? void 0 : _a.uri) && !ref.fullyQualified; }).length > 0) {
                    const exposeEdit = refactorEditUtils_1.RefactorEditUtils.exposeValueInModule(destinationTree, functionName);
                    if (exposeEdit) {
                        changes[params.destination.uri].push(exposeEdit);
                    }
                }
                // Change the module name of every reference that is fully qualified
                references.forEach((ref) => {
                    var _a;
                    if (ref.fullyQualified) {
                        if (ref.uri !== ((_a = params.destination) === null || _a === void 0 ? void 0 : _a.uri)) {
                            const edit = refactorEditUtils_1.RefactorEditUtils.changeQualifiedReferenceModule(ref.node, destinationModuleName);
                            if (edit) {
                                changes[ref.uri].push(edit);
                            }
                        }
                        else {
                            // Remove the qualified references altogether on the destination file
                            const edit = refactorEditUtils_1.RefactorEditUtils.removeQualifiedReference(ref.node);
                            if (edit) {
                                changes[ref.uri].push(edit);
                            }
                        }
                    }
                });
                // We don't want the destination file in the remaining edits
                referenceUris.delete(params.destination.uri);
                // Add the new imports for each file with a reference
                referenceUris.forEach((refUri) => {
                    if (refUri === params.sourceUri && !sourceHasReference) {
                        return;
                    }
                    const needToExpose = references
                        .filter((ref) => ref.uri === refUri)
                        .some((ref) => !ref.fullyQualified);
                    const refTree = forest.getTree(refUri);
                    if (refTree) {
                        const importEdit = refactorEditUtils_1.RefactorEditUtils.addImport(refTree, destinationModuleName, needToExpose ? functionName : undefined);
                        if (importEdit) {
                            changes[refUri].push(importEdit);
                        }
                    }
                });
                this.connection.workspace.applyEdit({ changes });
            }
        }
    }
}
exports.MoveRefactoringHandler = MoveRefactoringHandler;
//# sourceMappingURL=moveRefactoringHandler.js.map