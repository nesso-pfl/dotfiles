"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const treeUtils_1 = require("./util/treeUtils");
class Forest {
    constructor() {
        this.treeIndex = [];
    }
    getTree(uri) {
        const result = this.treeIndex.find((tree) => tree.uri === uri);
        return result && result.tree;
    }
    getExposingByModuleName(moduleName) {
        const result = this.treeIndex.find((tree) => tree.moduleName === moduleName);
        return result && result.exposing;
    }
    getTreeByModuleName(moduleName) {
        const result = this.treeIndex.find((tree) => tree.moduleName === moduleName);
        return result && result.tree;
    }
    getByModuleName(moduleName) {
        return this.treeIndex.find((tree) => tree.moduleName === moduleName);
    }
    getByUri(uri) {
        return this.treeIndex.find((tree) => tree.uri === uri);
    }
    setTree(uri, writeable, referenced, tree, maintainerAndPackageName) {
        const moduleResult = treeUtils_1.TreeUtils.getModuleNameAndExposing(tree);
        let moduleName;
        let exposing;
        if (moduleResult) {
            ({ moduleName, exposing } = moduleResult);
        }
        const existingTree = this.treeIndex.findIndex((a) => a.uri === uri);
        const treeContainer = {
            exposing,
            maintainerAndPackageName,
            moduleName,
            referenced,
            tree,
            uri,
            writeable,
        };
        if (existingTree === -1) {
            this.treeIndex.push(treeContainer);
        }
        else {
            this.treeIndex[existingTree] = treeContainer;
        }
    }
    removeTree(uri) {
        // Not sure this is the best way to do this...
        this.treeIndex = this.treeIndex.filter((tree) => tree.uri !== uri);
    }
}
exports.Forest = Forest;
//# sourceMappingURL=forest.js.map