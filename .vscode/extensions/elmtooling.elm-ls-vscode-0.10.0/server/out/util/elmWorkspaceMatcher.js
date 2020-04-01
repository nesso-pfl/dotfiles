"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noWorkspaceContainsError_1 = require("./noWorkspaceContainsError");
/**
 * Identifies the relevant ElmWorkspace for a given ParamType, either directly
 * (getElmWorkspaceFor) or when an event handler receives a ParamType
 * (handlerForWorkspace).
 */
class ElmWorkspaceMatcher {
    constructor(elmWorkspaces, getUriFor) {
        this.elmWorkspaces = elmWorkspaces;
        this.getUriFor = getUriFor;
    }
    handlerForWorkspace(handler) {
        return (param) => {
            return handler(param, this.getElmWorkspaceFor(param));
        };
    }
    getElmWorkspaceFor(param) {
        const uri = this.getUriFor(param);
        const workspace = 
        // first look for a workspace where the file has been parsed to a tree
        this.elmWorkspaces.find((ws) => ws.hasDocument(uri)) ||
            // fallback: find a workspace where the file is in the source-directories
            this.elmWorkspaces.find((ws) => ws.hasPath(uri));
        if (!workspace) {
            throw new noWorkspaceContainsError_1.NoWorkspaceContainsError(this.getUriFor(param));
        }
        return workspace;
    }
}
exports.ElmWorkspaceMatcher = ElmWorkspaceMatcher;
//# sourceMappingURL=elmWorkspaceMatcher.js.map