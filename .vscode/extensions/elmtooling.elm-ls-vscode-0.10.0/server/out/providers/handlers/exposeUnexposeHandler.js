"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elmWorkspaceMatcher_1 = require("../../util/elmWorkspaceMatcher");
const vscode_uri_1 = require("vscode-uri");
const protocol_1 = require("../../protocol");
const refactorEditUtils_1 = require("../../util/refactorEditUtils");
class ExposeUnexposeHandler {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.connection.onRequest(protocol_1.ExposeRequest, new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (params) => vscode_uri_1.URI.parse(params.uri)).handlerForWorkspace(this.handleExposeRequest.bind(this)));
        this.connection.onRequest(protocol_1.UnexposeRequest, new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (params) => vscode_uri_1.URI.parse(params.uri)).handlerForWorkspace(this.handleUnexposeRequest.bind(this)));
    }
    handleExposeRequest(params, elmWorkspace) {
        const forest = elmWorkspace.getForest();
        const tree = forest.getTree(params.uri);
        if (tree) {
            const edits = refactorEditUtils_1.RefactorEditUtils.exposeValueInModule(tree, params.name);
            if (edits) {
                this.connection.workspace.applyEdit({
                    changes: {
                        [params.uri]: [edits],
                    },
                });
            }
        }
    }
    handleUnexposeRequest(params, elmWorkspace) {
        const forest = elmWorkspace.getForest();
        const tree = forest.getTree(params.uri);
        if (tree) {
            const edits = refactorEditUtils_1.RefactorEditUtils.unexposedValueInModule(tree, params.name);
            if (edits) {
                this.connection.workspace.applyEdit({
                    changes: {
                        [params.uri]: [edits],
                    },
                });
            }
        }
    }
}
exports.ExposeUnexposeHandler = ExposeUnexposeHandler;
//# sourceMappingURL=exposeUnexposeHandler.js.map