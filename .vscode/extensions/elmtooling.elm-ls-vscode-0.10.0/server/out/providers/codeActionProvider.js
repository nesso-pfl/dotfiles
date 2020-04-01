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
const moveRefactoringHandler_1 = require("./handlers/moveRefactoringHandler");
const exposeUnexposeHandler_1 = require("./handlers/exposeUnexposeHandler");
const refactorEditUtils_1 = require("../util/refactorEditUtils");
class CodeActionProvider {
    constructor(connection, elmWorkspaces, settings, elmAnalyse, elmMake) {
        var _a;
        this.connection = connection;
        this.elmWorkspaces = elmWorkspaces;
        this.settings = settings;
        this.elmAnalyse = elmAnalyse;
        this.elmMake = elmMake;
        this.onCodeAction = this.onCodeAction.bind(this);
        this.onExecuteCommand = this.onExecuteCommand.bind(this);
        this.connection.onCodeAction(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.onCodeAction));
        this.connection.onExecuteCommand(this.onExecuteCommand);
        if ((_a = settings.extendedCapabilities) === null || _a === void 0 ? void 0 : _a.moveFunctionRefactoringSupport) {
            // tslint:disable-next-line: no-unused-expression
            new moveRefactoringHandler_1.MoveRefactoringHandler(this.connection, this.elmWorkspaces);
        }
        // tslint:disable-next-line: no-unused-expression
        new exposeUnexposeHandler_1.ExposeUnexposeHandler(this.connection, this.elmWorkspaces);
    }
    onCodeAction(params, elmWorkspace) {
        var _a;
        this.connection.console.info("A code action was requested");
        const analyse = (_a = (this.elmAnalyse && this.elmAnalyse.onCodeAction(params))) !== null && _a !== void 0 ? _a : [];
        const make = this.elmMake.onCodeAction(params);
        return [
            ...analyse,
            ...make,
            ...this.getRefactorCodeActions(params, elmWorkspace),
        ];
    }
    onExecuteCommand(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info("A command execution was requested");
            return this.elmAnalyse && this.elmAnalyse.onExecuteCommand(params);
        });
    }
    getRefactorCodeActions(params, elmWorkspace) {
        const codeActions = [];
        const forest = elmWorkspace.getForest();
        const tree = forest.getTree(params.textDocument.uri);
        if (tree) {
            const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, params.range.start);
            codeActions.push(...this.getFunctionCodeActions(params, tree, nodeAtPosition), ...this.getTypeAliasCodeActions(params, tree, nodeAtPosition));
        }
        return codeActions;
    }
    getFunctionCodeActions(params, tree, nodeAtPosition) {
        var _a, _b, _c;
        const codeActions = [];
        if (((_a = nodeAtPosition.parent) === null || _a === void 0 ? void 0 : _a.type) === "type_annotation" ||
            ((_b = nodeAtPosition.parent) === null || _b === void 0 ? void 0 : _b.type) === "function_declaration_left") {
            const functionName = nodeAtPosition.text;
            if ((_c = this.settings.extendedCapabilities) === null || _c === void 0 ? void 0 : _c.moveFunctionRefactoringSupport) {
                codeActions.push({
                    title: "Move Function",
                    command: {
                        title: "Refactor",
                        command: "elm.refactor",
                        arguments: ["moveFunction", params, functionName],
                    },
                    kind: vscode_languageserver_1.CodeActionKind.RefactorRewrite,
                });
            }
            if (treeUtils_1.TreeUtils.isExposedFunction(tree, functionName)) {
                const edit = refactorEditUtils_1.RefactorEditUtils.unexposedValueInModule(tree, functionName);
                if (edit) {
                    codeActions.push({
                        title: "Unexpose Function",
                        edit: {
                            changes: {
                                [params.textDocument.uri]: [edit],
                            },
                        },
                        kind: vscode_languageserver_1.CodeActionKind.Refactor,
                    });
                }
            }
            else {
                const edit = refactorEditUtils_1.RefactorEditUtils.exposeValueInModule(tree, functionName);
                if (edit) {
                    codeActions.push({
                        title: "Expose Function",
                        edit: {
                            changes: {
                                [params.textDocument.uri]: [edit],
                            },
                        },
                        kind: vscode_languageserver_1.CodeActionKind.Refactor,
                    });
                }
            }
        }
        return codeActions;
    }
    getTypeAliasCodeActions(params, tree, nodeAtPosition) {
        var _a, _b, _c;
        const codeActions = [];
        if (nodeAtPosition.type === "upper_case_identifier" &&
            (((_a = nodeAtPosition.parent) === null || _a === void 0 ? void 0 : _a.type) === "type_alias_declaration" ||
                ((_b = nodeAtPosition.parent) === null || _b === void 0 ? void 0 : _b.type) === "type_declaration")) {
            const typeName = nodeAtPosition.text;
            const alias = ((_c = nodeAtPosition.parent) === null || _c === void 0 ? void 0 : _c.type) === "type_alias_declaration"
                ? " Alias"
                : "";
            if (treeUtils_1.TreeUtils.isExposedTypeOrTypeAlias(tree, typeName)) {
                const edit = refactorEditUtils_1.RefactorEditUtils.unexposedValueInModule(tree, typeName);
                if (edit) {
                    codeActions.push({
                        title: `Unexpose Type${alias}`,
                        edit: {
                            changes: {
                                [params.textDocument.uri]: [edit],
                            },
                        },
                        kind: vscode_languageserver_1.CodeActionKind.Refactor,
                    });
                }
            }
            else {
                const edit = refactorEditUtils_1.RefactorEditUtils.exposeValueInModule(tree, typeName);
                if (edit) {
                    codeActions.push({
                        title: `Expose Type${alias}`,
                        edit: {
                            changes: {
                                [params.textDocument.uri]: [edit],
                            },
                        },
                        kind: vscode_languageserver_1.CodeActionKind.Refactor,
                    });
                }
            }
        }
        return codeActions;
    }
}
exports.CodeActionProvider = CodeActionProvider;
//# sourceMappingURL=codeActionProvider.js.map