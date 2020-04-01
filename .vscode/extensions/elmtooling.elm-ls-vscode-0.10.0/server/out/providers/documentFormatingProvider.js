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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_uri_1 = require("vscode-uri");
const Diff = __importStar(require("../util/diff"));
const elmUtils_1 = require("../util/elmUtils");
const elmWorkspaceMatcher_1 = require("../util/elmWorkspaceMatcher");
class DocumentFormattingProvider {
    constructor(connection, elmWorkspaces, events, settings) {
        this.connection = connection;
        this.events = events;
        this.settings = settings;
        this.formatText = (elmWorkspaceRootPath, elmFormatPath, text) => __awaiter(this, void 0, void 0, function* () {
            const options = {
                cmdArguments: ["--stdin", "--elm-version", "0.19", "--yes"],
                notFoundText: "Install elm-format via 'npm install -g elm-format",
            };
            try {
                const format = yield elmUtils_1.execCmd(elmFormatPath, "elm-format", options, elmWorkspaceRootPath.fsPath, this.connection, text);
                return Diff.getTextRangeChanges(text, format.stdout);
            }
            catch (error) {
                this.connection.console.warn(JSON.stringify(error));
            }
        });
        this.handleFormattingRequest = (params, elmWorkspace) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info(`Formatting was requested`);
            try {
                const text = this.events.get(params.textDocument.uri);
                if (!text) {
                    this.connection.console.error("Can't find file for formatting.");
                    return;
                }
                const settings = yield this.settings.getClientSettings();
                return yield this.formatText(elmWorkspace.getRootPath(), settings.elmFormatPath, text.getText());
            }
            catch (error) {
                error.message.includes("SYNTAX PROBLEM")
                    ? this.connection.console.error("Running elm-format failed. Check the file for syntax errors.")
                    : this.connection.window.showErrorMessage("Running elm-format failed. Install via " +
                        "'npm install -g elm-format' and make sure it's on your path");
            }
        });
        this.connection.onDocumentFormatting(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (params) => vscode_uri_1.URI.parse(params.textDocument.uri)).handlerForWorkspace(this.handleFormattingRequest));
    }
}
exports.DocumentFormattingProvider = DocumentFormattingProvider;
//# sourceMappingURL=documentFormatingProvider.js.map