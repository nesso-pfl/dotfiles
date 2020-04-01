#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = __importStar(require("path"));
const vscode_languageserver_1 = require("vscode-languageserver");
const web_tree_sitter_1 = __importDefault(require("web-tree-sitter"));
// Show version for `-v` or `--version` arguments
if (process.argv[2] === "-v" || process.argv[2] === "--version") {
    // require is used to avoid loading package if not necessary (~30ms time difference)
    // tslint:disable-next-line no-var-requires
    process.stdout.write(`${require("pjson").version}\n`);
    process.exit(0);
}
// default argument `--stdio`
if (process.argv.length === 2) {
    process.argv.push("--stdio");
}
const connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
let server;
connection.onInitialize((params, cancel, progress) => __awaiter(void 0, void 0, void 0, function* () {
    yield web_tree_sitter_1.default.init();
    const absolute = Path.join(__dirname, "tree-sitter-elm.wasm");
    const pathToWasm = Path.relative(process.cwd(), absolute);
    connection.console.info(`Loading Elm tree-sitter syntax from ${pathToWasm}`);
    const language = yield web_tree_sitter_1.default.Language.load(pathToWasm);
    const parser = new web_tree_sitter_1.default();
    parser.setLanguage(language);
    const { Server } = yield Promise.resolve().then(() => __importStar(require("./server")));
    server = new Server(connection, params, parser, progress);
    yield server.init();
    return server.capabilities;
}));
connection.onInitialized(() => {
    server.registerInitializedProviders();
});
// Listen on the connection
connection.listen();
// Don't die on unhandled Promise rejections
process.on("unhandledRejection", (reason, p) => {
    connection.console.error(`Unhandled Rejection at: Promise ${p} reason:, ${reason}`);
});
//# sourceMappingURL=index.js.map