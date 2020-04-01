"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const elmUtils_1 = require("../util/elmUtils");
const elmWorkspaceMatcher_1 = require("../util/elmWorkspaceMatcher");
const hintHelper_1 = require("../util/hintHelper");
const treeUtils_1 = require("../util/treeUtils");
class HoverProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.handleHoverRequest = (params, elmWorkspace) => {
            this.connection.console.info(`A hover was requested`);
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(params.textDocument.uri);
            if (tree) {
                const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, params.position);
                const definitionNode = treeUtils_1.TreeUtils.findDefinitionNodeByReferencingNode(nodeAtPosition, params.textDocument.uri, tree, elmWorkspace.getImports());
                if (definitionNode) {
                    return this.createMarkdownHoverFromDefinition(definitionNode);
                }
                else {
                    const specialMatch = elmUtils_1.getEmptyTypes().find(a => a.name === nodeAtPosition.text);
                    if (specialMatch) {
                        return {
                            contents: {
                                kind: vscode_languageserver_1.MarkupKind.Markdown,
                                value: specialMatch.markdown,
                            },
                        };
                    }
                }
            }
        };
        this.connection.onHover(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.handleHoverRequest));
    }
    createMarkdownHoverFromDefinition(definitionNode) {
        if (definitionNode) {
            const value = definitionNode.nodeType === "FunctionParameter" ||
                definitionNode.nodeType === "AnonymousFunctionParameter" ||
                definitionNode.nodeType === "CasePattern"
                ? hintHelper_1.HintHelper.createHintFromFunctionParameter(definitionNode.node)
                : hintHelper_1.HintHelper.createHint(definitionNode.node);
            if (value) {
                return {
                    contents: {
                        kind: vscode_languageserver_1.MarkupKind.Markdown,
                        value,
                    },
                };
            }
        }
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hoverProvider.js.map