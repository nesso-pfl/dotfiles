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
const positionUtil_1 = require("../positionUtil");
const elmWorkspaceMatcher_1 = require("../util/elmWorkspaceMatcher");
const treeUtils_1 = require("../util/treeUtils");
class SelectionRangeProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.handleSelectionRangeRequest = (params, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Selection Ranges were requested`);
            const ret = [];
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(params.textDocument.uri);
            if (tree) {
                params.positions.forEach((position) => {
                    const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, position);
                    const newRange = {
                        start: positionUtil_1.PositionUtil.FROM_TS_POSITION(nodeAtPosition.startPosition).toVSPosition(),
                        end: positionUtil_1.PositionUtil.FROM_TS_POSITION(nodeAtPosition.endPosition).toVSPosition(),
                    };
                    ret.push({
                        range: newRange,
                        parent: this.getParentNode(nodeAtPosition, newRange),
                    });
                });
            }
            return ret ? ret : null;
        });
        connection.onSelectionRanges(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.handleSelectionRangeRequest));
    }
    getParentNode(node, previousRange) {
        if (node.parent) {
            const newRange = {
                start: positionUtil_1.PositionUtil.FROM_TS_POSITION(node.parent.startPosition).toVSPosition(),
                end: positionUtil_1.PositionUtil.FROM_TS_POSITION(node.parent.endPosition).toVSPosition(),
            };
            if (previousRange.start.line === newRange.start.line &&
                previousRange.start.character === newRange.start.character &&
                previousRange.end.line === newRange.end.line &&
                previousRange.end.character === newRange.end.character) {
                // Skip ranges that match
                return this.getParentNode(node.parent, previousRange);
            }
            else {
                return {
                    range: newRange,
                    parent: this.getParentNode(node.parent, newRange),
                };
            }
        }
    }
}
exports.SelectionRangeProvider = SelectionRangeProvider;
//# sourceMappingURL=selectionRangeProvider.js.map