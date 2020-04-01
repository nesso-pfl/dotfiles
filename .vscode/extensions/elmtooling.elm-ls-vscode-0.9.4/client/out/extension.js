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
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const Package = require("./elmPackage");
const clients = new Map();
let sortedWorkspaceFolders;
function getSortedWorkspaceFolders() {
    if (sortedWorkspaceFolders === void 0) {
        sortedWorkspaceFolders = vscode_1.workspace.workspaceFolders
            ? vscode_1.workspace.workspaceFolders
                .map(folder => {
                let result = folder.uri.toString();
                if (result.charAt(result.length - 1) !== "/") {
                    result = result + "/";
                }
                return result;
            })
                .sort((a, b) => {
                return a.length - b.length;
            })
            : [];
    }
    return sortedWorkspaceFolders;
}
vscode_1.workspace.onDidChangeWorkspaceFolders(() => (sortedWorkspaceFolders = undefined));
function getOuterMostWorkspaceFolder(folder) {
    const sorted = getSortedWorkspaceFolders();
    for (const element of sorted) {
        let uri = folder.uri.toString();
        if (uri.charAt(uri.length - 1) !== "/") {
            uri = uri + "/";
        }
        if (uri.startsWith(element)) {
            return vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.parse(element));
        }
    }
    return folder;
}
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const module = context.asAbsolutePath(path.join("server", "out", "index.js"));
        function didOpenTextDocument(document) {
            // We are only interested in everything elm, no handling for untitled files for now
            if (document.languageId !== "elm") {
                return;
            }
            const config = vscode_1.workspace.getConfiguration().get("elmLS");
            const uri = document.uri;
            let folder = vscode_1.workspace.getWorkspaceFolder(uri);
            // Files outside a folder can't be handled. This might depend on the language.
            // Single file languages like JSON might handle files outside the workspace folders.
            if (!folder) {
                return;
            }
            // If we have nested workspace folders we only start a server on the outer most workspace folder.
            folder = getOuterMostWorkspaceFolder(folder);
            if (!clients.has(folder.uri.toString())) {
                const relativeWorkspace = folder.name;
                const outputChannel = vscode_1.window.createOutputChannel(relativeWorkspace.length > 1 ? `Elm (${relativeWorkspace})` : "Elm");
                const debugOptions = {
                    execArgv: ["--nolazy", `--inspect=${6010 + clients.size}`],
                };
                const serverOptions = {
                    debug: {
                        module,
                        options: debugOptions,
                        transport: vscode_languageclient_1.TransportKind.ipc,
                    },
                    run: { module, transport: vscode_languageclient_1.TransportKind.ipc },
                };
                const clientOptions = {
                    diagnosticCollectionName: "Elm",
                    documentSelector: [
                        {
                            language: "elm",
                            pattern: `${folder.uri.fsPath}/**/*`,
                            scheme: "file",
                        },
                    ],
                    synchronize: {
                        fileEvents: vscode_1.workspace.createFileSystemWatcher("**/*.elm"),
                    },
                    initializationOptions: config
                        ? {
                            elmAnalyseTrigger: config.elmAnalyseTrigger,
                            elmFormatPath: config.elmFormatPath,
                            elmPath: config.elmPath,
                            elmTestPath: config.elmTestPath,
                            trace: {
                                server: config.trace.server,
                            },
                        }
                        : {},
                    middleware: new CodeLensResolver(),
                    outputChannel,
                    progressOnInitialization: true,
                    revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
                    workspaceFolder: folder,
                };
                const client = new vscode_languageclient_1.LanguageClient("elmLS", "Elm", serverOptions, clientOptions);
                client.start();
                clients.set(folder.uri.toString(), client);
            }
        }
        vscode_1.workspace.onDidOpenTextDocument(didOpenTextDocument);
        vscode_1.workspace.textDocuments.forEach(didOpenTextDocument);
        vscode_1.workspace.onDidChangeWorkspaceFolders(event => {
            for (const folder of event.removed) {
                const client = clients.get(folder.uri.toString());
                if (client) {
                    clients.delete(folder.uri.toString());
                    client.stop();
                }
            }
        });
        const packageDisposables = Package.activatePackage();
        packageDisposables.forEach(d => context.subscriptions.push(d));
    });
}
exports.activate = activate;
function deactivate() {
    const promises = [];
    for (const client of clients.values()) {
        promises.push(client.stop());
    }
    return Promise.all(promises).then(() => undefined);
}
exports.deactivate = deactivate;
class CodeLensResolver {
    resolveCodeLens(codeLens, token, next) {
        const resolvedCodeLens = next(codeLens, token);
        const resolveFunc = (codeLensToFix) => {
            if (codeLensToFix &&
                codeLensToFix.command &&
                codeLensToFix.command.command === "editor.action.showReferences" &&
                codeLensToFix.command.arguments) {
                const oldArgs = codeLensToFix.command.arguments;
                // Our JSON objects don't get handled correctly by
                // VS Code's built in editor.action.showReferences
                // command so we need to convert them into the
                // appropriate types to send them as command
                // arguments.
                codeLensToFix.command.arguments = [
                    vscode_1.Uri.parse(oldArgs[0].uri),
                    new vscode_1.Position(oldArgs[0].range.start.line, oldArgs[0].range.start.character),
                    oldArgs[0].references.map((position) => {
                        return new vscode_1.Location(vscode_1.Uri.parse(position.uri), new vscode_1.Range(position.range.start.line, position.range.start.character, position.range.end.line, position.range.end.character));
                    }),
                ];
            }
            return codeLensToFix;
        };
        if (resolvedCodeLens.then) {
            return resolvedCodeLens.then(resolveFunc);
        }
        else if (resolvedCodeLens) {
            return resolveFunc(resolvedCodeLens);
        }
        return resolvedCodeLens;
    }
}
exports.CodeLensResolver = CodeLensResolver;
//# sourceMappingURL=extension.js.map