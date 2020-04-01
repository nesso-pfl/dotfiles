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
class CodeLensProvider {
    constructor(connection, elmWorkspaces, settings) {
        this.connection = connection;
        this.settings = settings;
        this.handleCodeLensRequest = (param, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`A code lens was requested for ${param.textDocument.uri}`);
            const codeLens = [];
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(param.textDocument.uri);
            if (tree) {
                codeLens.push(...this.getExposingCodeLenses(tree, param.textDocument.uri));
                codeLens.push(...this.getReferencesCodeLenses(tree, param.textDocument.uri));
                return codeLens;
            }
        });
        this.handleCodeLensResolveRequest = (param, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const codelens = param;
            const data = codelens.data;
            this.connection.console.info(`A code lens resolve was requested for ${data.uri}`);
            const imports = elmWorkspace.getImports();
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(data.uri);
            if (tree && data.codeLensType) {
                switch (data.codeLensType) {
                    case "exposed":
                        const exposed = data.isFunction
                            ? treeUtils_1.TreeUtils.isExposedFunction(tree, data.nameNode)
                            : treeUtils_1.TreeUtils.isExposedTypeOrTypeAlias(tree, data.nameNode);
                        codelens.command = ((_a = this.settings.extendedCapabilities) === null || _a === void 0 ? void 0 : _a.exposeUnexposeSupport) ? exposed
                            ? vscode_languageserver_1.Command.create("exposed", "elm.unexpose", {
                                uri: data.uri,
                                name: data.nameNode,
                            })
                            : vscode_languageserver_1.Command.create("local", "elm.expose", {
                                uri: data.uri,
                                name: data.nameNode,
                            })
                            : exposed
                                ? vscode_languageserver_1.Command.create("exposed", "")
                                : vscode_languageserver_1.Command.create("local", "");
                        break;
                    case "referenceCounter":
                        const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, param.range.start);
                        const definitionNode = treeUtils_1.TreeUtils.findDefinitionNodeByReferencingNode(nodeAtPosition, data.uri, tree, imports);
                        const references = references_1.References.find(definitionNode, forest, imports);
                        let refLocations = [];
                        if (references) {
                            refLocations = references.map((a) => vscode_languageserver_1.Location.create(a.uri, vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(a.node.startPosition.row, a.node.startPosition.column), vscode_languageserver_1.Position.create(a.node.endPosition.row, a.node.endPosition.column))));
                        }
                        codelens.command = vscode_languageserver_1.Command.create(references.length === 1
                            ? "1 reference"
                            : `${references.length} references`, "editor.action.showReferences", {
                            range: param.range,
                            references: refLocations,
                            uri: data.uri,
                        });
                        break;
                    default:
                        break;
                }
            }
            return codelens;
        });
        this.connection.onCodeLens(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.handleCodeLensRequest));
        this.connection.onCodeLensResolve(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.data.uri)).handlerForWorkspace(this.handleCodeLensResolveRequest));
    }
    createExposingCodeLens(node, nameNode, uri, isFunction) {
        return vscode_languageserver_1.CodeLens.create(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(node.startPosition.row, node.startPosition.column), vscode_languageserver_1.Position.create(node.endPosition.row, node.endPosition.column)), { codeLensType: "exposed", nameNode: nameNode.text, isFunction, uri });
    }
    createReferenceCodeLens(placementNode, uri) {
        return vscode_languageserver_1.CodeLens.create(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(placementNode.startPosition.row, placementNode.startPosition.column), vscode_languageserver_1.Position.create(placementNode.endPosition.row, placementNode.endPosition.column)), {
            codeLensType: "referenceCounter",
            uri,
        });
    }
    getExposingCodeLenses(tree, uri) {
        const codeLens = [];
        tree.rootNode.children.forEach((node) => {
            if (node.type === "value_declaration") {
                const functionName = treeUtils_1.TreeUtils.getFunctionNameNodeFromDefinition(node);
                if (functionName) {
                    if (node.previousNamedSibling &&
                        node.previousNamedSibling.type === "type_annotation") {
                        codeLens.push(this.createExposingCodeLens(node.previousNamedSibling, functionName, uri, true));
                    }
                    else {
                        codeLens.push(this.createExposingCodeLens(node, functionName, uri, true));
                    }
                }
            }
            else if (node.type === "type_declaration" ||
                node.type === "type_alias_declaration") {
                const typeNode = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", node);
                if (typeNode) {
                    codeLens.push(this.createExposingCodeLens(node, typeNode, uri, false));
                }
            }
        });
        return codeLens;
    }
    getReferencesCodeLenses(tree, uri) {
        const codeLens = [];
        tree.rootNode.children.forEach((node) => {
            if (node.type === "type_declaration" ||
                node.type === "type_alias_declaration") {
                const typeNode = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", node);
                if (typeNode) {
                    codeLens.push(this.createReferenceCodeLens(typeNode, uri));
                }
            }
        });
        treeUtils_1.TreeUtils.descendantsOfType(tree.rootNode, "value_declaration").forEach((node) => {
            const functionName = treeUtils_1.TreeUtils.getFunctionNameNodeFromDefinition(node);
            if (functionName) {
                if (node.previousNamedSibling &&
                    node.previousNamedSibling.type === "type_annotation") {
                    codeLens.push(this.createReferenceCodeLens(node.previousNamedSibling, uri));
                }
                else {
                    codeLens.push(this.createReferenceCodeLens(node, uri));
                }
            }
        });
        const moduleNameNode = treeUtils_1.TreeUtils.getModuleNameNode(tree);
        if (moduleNameNode && moduleNameNode.lastChild) {
            codeLens.push(this.createReferenceCodeLens(moduleNameNode, uri));
        }
        return codeLens;
    }
}
exports.CodeLensProvider = CodeLensProvider;
//# sourceMappingURL=codeLensProvider.js.map