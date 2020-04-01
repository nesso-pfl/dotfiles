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
class FoldingRangeProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.REGION_CONSTRUCTS = new Set([
            "case_of_expr",
            "value_declaration",
            "type_alias_declaration",
            "type_declaration",
            "record_expr",
            "case_of_branch",
            "let",
            "in",
            "if",
            "then",
            "else",
        ]);
        this.handleFoldingRange = (param, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Folding ranges were requested`);
            const folds = [];
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(param.textDocument.uri);
            const findLastIdenticalNamedSibling = (node) => {
                while (true) {
                    if (node.nextNamedSibling &&
                        node.nextNamedSibling.type === "import_clause") {
                        node = node.nextNamedSibling;
                    }
                    else {
                        return node;
                    }
                }
            };
            const traverse = (node) => {
                if (node.parent && node.parent.lastChild && node.isNamed) {
                    if ("import_clause" === node.type) {
                        if (node.previousNamedSibling === null ||
                            node.previousNamedSibling.type !== "import_clause") {
                            const lastNode = findLastIdenticalNamedSibling(node);
                            folds.push({
                                endCharacter: lastNode.endPosition.column,
                                endLine: lastNode.endPosition.row,
                                kind: vscode_languageserver_1.FoldingRangeKind.Imports,
                                startCharacter: node.startPosition.column,
                                startLine: node.startPosition.row,
                            });
                        }
                    }
                    else if (this.REGION_CONSTRUCTS.has(node.type)) {
                        folds.push({
                            endCharacter: node.endPosition.column,
                            endLine: node.endPosition.row,
                            kind: vscode_languageserver_1.FoldingRangeKind.Region,
                            startCharacter: node.startPosition.column,
                            startLine: node.startPosition.row,
                        });
                    }
                    else if ("block_comment" === node.type) {
                        folds.push({
                            endCharacter: node.endPosition.column,
                            endLine: node.endPosition.row,
                            kind: vscode_languageserver_1.FoldingRangeKind.Comment,
                            startCharacter: node.startPosition.column,
                            startLine: node.startPosition.row,
                        });
                    }
                }
                for (const childNode of node.children) {
                    traverse(childNode);
                }
            };
            if (tree) {
                traverse(tree.rootNode);
            }
            this.connection.console.info(`Returned ${folds.length} folding ranges`);
            return folds;
        });
        connection.onFoldingRanges(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.handleFoldingRange));
    }
}
exports.FoldingRangeProvider = FoldingRangeProvider;
//# sourceMappingURL=foldingProvider.js.map