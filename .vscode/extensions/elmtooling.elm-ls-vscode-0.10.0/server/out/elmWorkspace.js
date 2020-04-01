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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const globby_1 = __importDefault(require("globby"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const vscode_uri_1 = require("vscode-uri");
const forest_1 = require("./forest");
const imports_1 = require("./imports");
const utils = __importStar(require("./util/elmUtils"));
const readFile = util_1.default.promisify(fs_1.default.readFile);
const readdir = util_1.default.promisify(fs_1.default.readdir);
class ElmWorkspace {
    constructor(rootPath, connection, settings, parser) {
        this.rootPath = rootPath;
        this.connection = connection;
        this.settings = settings;
        this.parser = parser;
        this.elmFolders = [];
        this.forest = new forest_1.Forest();
        this.connection.console.info(`Starting language server for folder: ${this.rootPath}`);
        this.imports = new imports_1.Imports(parser);
    }
    init(progressCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initWorkspace(progressCallback);
        });
    }
    hasDocument(uri) {
        return !!this.forest.getTree(uri.toString());
    }
    hasPath(uri) {
        return this.elmFolders
            .map((f) => f.uri)
            .some((elmFolder) => uri.fsPath.startsWith(elmFolder));
    }
    getForest() {
        return this.forest;
    }
    getImports() {
        return this.imports;
    }
    getRootPath() {
        return this.rootPath;
    }
    initWorkspace(progressCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let progress = 0;
            let elmVersion;
            try {
                elmVersion = yield utils.getElmVersion(yield this.settings.getClientSettings(), this.rootPath, this.connection);
            }
            catch (e) {
                this.connection.console.warn(`Could not figure out elm version, this will impact how good the server works. \n ${e.stack}`);
            }
            const pathToElmJson = path_1.default.join(this.rootPath.fsPath, "elm.json");
            this.connection.console.info(`Reading elm.json from ${pathToElmJson}`);
            try {
                // Find elm files and feed them to tree sitter
                const elmJson = require(pathToElmJson);
                const type = elmJson.type;
                if (type === "application") {
                    elmJson["source-directories"].forEach((folder) => __awaiter(this, void 0, void 0, function* () {
                        this.elmFolders.push({
                            maintainerAndPackageName: undefined,
                            uri: path_1.default.resolve(this.rootPath.fsPath, folder),
                            writeable: true,
                        });
                    }));
                }
                else {
                    this.elmFolders.push({
                        maintainerAndPackageName: undefined,
                        uri: path_1.default.join(this.rootPath.fsPath, "src"),
                        writeable: true,
                    });
                }
                this.elmFolders.push({
                    maintainerAndPackageName: undefined,
                    uri: path_1.default.join(this.rootPath.fsPath, "tests"),
                    writeable: true,
                });
                this.connection.console.info(`${this.elmFolders.length} source-dirs and test folders found`);
                const elmHome = this.findElmHome();
                const packagesRoot = `${elmHome}/${elmVersion}/${this.packageOrPackagesFolder(elmVersion)}/`;
                const dependencies = type === "application"
                    ? Object.assign(Object.assign({}, elmJson.dependencies.direct), elmJson["test-dependencies"].direct) : Object.assign(Object.assign({}, elmJson.dependencies), elmJson["test-dependencies"]);
                if (type === "application") {
                    for (const key in dependencies) {
                        if (dependencies.hasOwnProperty(key)) {
                            const maintainer = key.substring(0, key.indexOf("/"));
                            const packageName = key.substring(key.indexOf("/") + 1, key.length);
                            const pathToPackageWithVersion = `${packagesRoot}${maintainer}/${packageName}/${dependencies[key]}/src`;
                            this.elmFolders.push({
                                maintainerAndPackageName: `${maintainer}/${packageName}`,
                                uri: pathToPackageWithVersion,
                                writeable: false,
                            });
                        }
                    }
                }
                else {
                    for (const key in dependencies) {
                        if (dependencies.hasOwnProperty(key)) {
                            const maintainer = key.substring(0, key.indexOf("/"));
                            const packageName = key.substring(key.indexOf("/") + 1, key.length);
                            const pathToPackage = `${packagesRoot}${maintainer}/${packageName}/`;
                            const readDir = yield readdir(pathToPackage, "utf8");
                            const allVersionFolders = readDir.map((folderName) => {
                                return {
                                    version: folderName,
                                    versionPath: `${pathToPackage}${folderName}`,
                                };
                            });
                            const matchedFolder = utils.findDepVersion(allVersionFolders, dependencies[key]);
                            const pathToPackageWithVersion = matchedFolder
                                ? `${matchedFolder.versionPath}/src`
                                : `${allVersionFolders[allVersionFolders.length - 1].versionPath}/src`;
                            this.elmFolders.push({
                                maintainerAndPackageName: `${maintainer}/${packageName}`,
                                uri: pathToPackageWithVersion,
                                writeable: false,
                            });
                        }
                    }
                }
                const elmFilePaths = this.findElmFilesInFolders(this.elmFolders);
                this.connection.console.info(`Found ${elmFilePaths.length.toString()} files to add to the project`);
                if (elmFilePaths.every((a) => !a.writeable)) {
                    this.connection.window.showErrorMessage("The path or paths you entered in the 'source-directories' field of your 'elm.json' does not contain any elm files.");
                }
                const promiseList = [];
                const PARSE_STAGES = 3;
                const progressDelta = 100 / (elmFilePaths.length * PARSE_STAGES);
                for (const filePath of elmFilePaths) {
                    progressCallback((progress += progressDelta));
                    promiseList.push(this.readAndAddToForest(filePath, () => {
                        progressCallback((progress += progressDelta));
                    }));
                }
                yield Promise.all(promiseList);
                this.forest.treeIndex.forEach((item) => {
                    this.connection.console.info(`Adding imports ${vscode_uri_1.URI.parse(item.uri).fsPath}`);
                    this.imports.updateImports(item.uri, item.tree, this.forest);
                    progressCallback((progress += progressDelta));
                });
                this.connection.console.info(`Done parsing all files for ${pathToElmJson}`);
            }
            catch (error) {
                this.connection.console.error(`Error parsing files for ${pathToElmJson}:\n${error.stack}`);
            }
        });
    }
    findElmFilesInFolders(elmFolders) {
        let elmFilePaths = [];
        for (const element of elmFolders) {
            elmFilePaths = elmFilePaths.concat(this.findElmFilesInFolder(element));
        }
        return elmFilePaths;
    }
    findElmFilesInFolder(element) {
        // Cleanup the path on windows, as globby does not like backslashes
        const globUri = element.uri.replace(/\\/g, "/");
        return globby_1.default
            .sync(`${globUri}/**/*.elm`, { suppressErrors: true })
            .map((matchingPath) => ({
            maintainerAndPackageName: element.maintainerAndPackageName,
            path: matchingPath,
            writeable: element.writeable,
        }));
    }
    packageOrPackagesFolder(elmVersion) {
        return elmVersion === "0.19.0" ? "package" : "packages";
    }
    findElmHome() {
        const elmHomeVar = process.env.ELM_HOME;
        if (elmHomeVar) {
            return elmHomeVar;
        }
        return utils.isWindows
            ? `${os_1.default.homedir()}/AppData/Roaming/elm`
            : `${os_1.default.homedir()}/.elm`;
    }
    readAndAddToForest(filePath, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.connection.console.info(`Adding ${filePath.path.toString()}`);
                    const fileContent = yield readFile(filePath.path.toString(), {
                        encoding: "utf-8",
                    });
                    const tree = this.parser.parse(fileContent);
                    this.forest.setTree(vscode_uri_1.URI.file(filePath.path).toString(), filePath.writeable, true, tree, filePath.maintainerAndPackageName);
                    callback();
                    resolve();
                }
                catch (error) {
                    this.connection.console.error(error.stack);
                    reject(error);
                }
            }));
        });
    }
}
exports.ElmWorkspace = ElmWorkspace;
//# sourceMappingURL=elmWorkspace.js.map