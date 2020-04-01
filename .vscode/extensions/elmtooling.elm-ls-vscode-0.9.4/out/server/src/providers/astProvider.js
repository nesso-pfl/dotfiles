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
const fs_1 = require("fs");
const vscode_uri_1 = require("vscode-uri");
const elmWorkspaceMatcher_1 = require("../util/elmWorkspaceMatcher");
class ASTProvider {
    constructor(connection, elmWorkspaces, documentEvents, parser) {
        this.connection = connection;
        this.parser = parser;
        this.handleChangeTextDocument = (params, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Changed text document, going to parse it. ${params.textDocument.uri}`);
            const forest = elmWorkspace.getForest();
            const imports = elmWorkspace.getImports();
            const document = params.textDocument;
            let tree = forest.getTree(document.uri);
            if (tree === undefined) {
                const fileContent = fs_1.readFileSync(vscode_uri_1.URI.parse(document.uri).fsPath, "utf8");
                tree = this.parser.parse(fileContent);
            }
            for (const changeEvent of params.contentChanges) {
                tree = this.parser.parse(changeEvent.text);
            }
            if (tree) {
                forest.setTree(document.uri, true, true, tree);
                imports.updateImports(document.uri, tree, forest);
            }
        });
        documentEvents.on("change", new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (params) => vscode_uri_1.URI.parse(params.textDocument.uri)).handlerForWorkspace(this.handleChangeTextDocument));
    }
}
exports.ASTProvider = ASTProvider;
//# sourceMappingURL=astProvider.js.map