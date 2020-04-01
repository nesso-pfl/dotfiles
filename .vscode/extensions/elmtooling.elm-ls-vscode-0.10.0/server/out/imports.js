"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const treeUtils_1 = require("./util/treeUtils");
class Imports {
    constructor(parser) {
        this.parser = parser;
        this.imports = {};
    }
    updateImports(uri, tree, forest) {
        var _a;
        const result = [];
        // Add standard imports
        let importNodes = this.getVirtualImports();
        importNodes = importNodes.concat((_a = treeUtils_1.TreeUtils.findAllNamedChildrenOfType("import_clause", tree.rootNode)) !== null && _a !== void 0 ? _a : []);
        if (importNodes) {
            importNodes.forEach((importNode) => {
                const moduleNameNode = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_qid", importNode);
                if (moduleNameNode) {
                    const foundModule = forest.getByModuleName(moduleNameNode.text);
                    if (foundModule) {
                        const foundModuleNode = treeUtils_1.TreeUtils.findModuleDeclaration(foundModule.tree);
                        if (foundModuleNode) {
                            result.push({
                                alias: moduleNameNode.text,
                                fromModuleName: moduleNameNode.text,
                                fromUri: foundModule.uri,
                                maintainerAndPackageName: foundModule.maintainerAndPackageName,
                                node: foundModuleNode,
                                type: "Module",
                            });
                            const exposedFromRemoteModule = forest.getExposingByModuleName(moduleNameNode.text);
                            if (exposedFromRemoteModule) {
                                result.push(...this.getPrefixedCompletions(moduleNameNode, importNode, exposedFromRemoteModule, foundModule.uri, foundModule.maintainerAndPackageName));
                                const exposingList = treeUtils_1.TreeUtils.findFirstNamedChildOfType("exposing_list", importNode);
                                if (exposingList) {
                                    const doubleDot = treeUtils_1.TreeUtils.findFirstNamedChildOfType("double_dot", exposingList);
                                    if (doubleDot) {
                                        result.push(...this.getAllExposedCompletions(exposedFromRemoteModule, moduleNameNode.text, foundModule.uri, foundModule.maintainerAndPackageName));
                                    }
                                    else {
                                        const exposedOperators = treeUtils_1.TreeUtils.descendantsOfType(exposingList, "operator_identifier");
                                        if (exposedOperators.length > 0) {
                                            const exposedNodes = exposedFromRemoteModule.filter((element) => {
                                                return exposedOperators.find((a) => a.text === element.name);
                                            });
                                            result.push(...this.exposedNodesToImports(exposedNodes, moduleNameNode, foundModule));
                                        }
                                        const exposedValues = treeUtils_1.TreeUtils.findAllNamedChildrenOfType("exposed_value", exposingList);
                                        if (exposedValues) {
                                            const exposedNodes = exposedFromRemoteModule.filter((element) => {
                                                return exposedValues.find((a) => a.text === element.name);
                                            });
                                            result.push(...this.exposedNodesToImports(exposedNodes, moduleNameNode, foundModule));
                                        }
                                        const exposedType = treeUtils_1.TreeUtils.findAllNamedChildrenOfType("exposed_type", exposingList);
                                        if (exposedType) {
                                            const exposedNodes = exposedFromRemoteModule.filter((element) => {
                                                return exposedType.find((a) => {
                                                    const typeName = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", a);
                                                    if (typeName) {
                                                        return typeName.text === element.name;
                                                    }
                                                    else {
                                                        return false;
                                                    }
                                                });
                                            });
                                            result.push(...this.exposedNodesToImports(exposedNodes, moduleNameNode, foundModule));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        if (!this.imports) {
            this.imports = {};
        }
        this.imports[uri] = result;
    }
    getPrefixedCompletions(moduleNameNode, importNode, exposed, uri, maintainerAndPackageName) {
        const result = [];
        const importedAs = this.findImportAsClause(importNode);
        const importPrefix = importedAs ? importedAs : moduleNameNode.text;
        exposed.forEach((element) => {
            switch (element.type) {
                case "Function":
                case "TypeAlias":
                    result.push({
                        alias: `${importPrefix}.${element.name}`,
                        fromModuleName: moduleNameNode.text,
                        fromUri: uri,
                        maintainerAndPackageName,
                        node: element.syntaxNode,
                        type: element.type,
                    });
                    break;
                case "Type":
                    result.push({
                        alias: `${importPrefix}.${element.name}`,
                        fromModuleName: moduleNameNode.text,
                        fromUri: uri,
                        maintainerAndPackageName,
                        node: element.syntaxNode,
                        type: element.type,
                    });
                    if (element.exposedUnionConstructors) {
                        result.push(...element.exposedUnionConstructors.map((a) => {
                            return {
                                alias: `${importPrefix}.${a.name}`,
                                fromModuleName: moduleNameNode.text,
                                fromUri: uri,
                                maintainerAndPackageName,
                                node: a.syntaxNode,
                                type: "UnionConstructor",
                            };
                        }));
                        result.push(...element.exposedUnionConstructors
                            .filter((a) => a.accessibleWithoutPrefix)
                            .map((a) => {
                            return {
                                alias: `${a.name}`,
                                fromModuleName: moduleNameNode.text,
                                fromUri: uri,
                                maintainerAndPackageName,
                                node: a.syntaxNode,
                                type: "UnionConstructor",
                            };
                        }));
                    }
                    break;
                // Do not handle operators, they are not valid if prefixed
            }
        });
        return result;
    }
    getVirtualImports() {
        const virtualImports = `
    import Basics exposing (..)
import List exposing (List, (::))
import Maybe exposing (Maybe(..))
import Result exposing (Result(..))
import String exposing (String)
import Char exposing (Char)
import Tuple

import Debug

import Platform exposing ( Program )
import Platform.Cmd as Cmd exposing ( Cmd )
import Platform.Sub as Sub exposing ( Sub )
    `;
        const importTree = this.parser.parse(virtualImports);
        return importTree.rootNode.children;
    }
    findImportAsClause(importNode) {
        const asClause = treeUtils_1.TreeUtils.findFirstNamedChildOfType("as_clause", importNode);
        if (asClause) {
            const newName = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", asClause);
            if (newName) {
                return newName.text;
            }
        }
    }
    getAllExposedCompletions(exposed, moduleName, uri, maintainerAndPackageName) {
        const result = [];
        exposed.forEach((element) => {
            result.push({
                alias: element.name,
                fromModuleName: moduleName,
                fromUri: uri,
                maintainerAndPackageName,
                node: element.syntaxNode,
                type: element.type,
            });
        });
        return result;
    }
    exposedNodesToImports(exposedNodes, moduleNameNode, foundModule) {
        return exposedNodes.map((a) => {
            return {
                alias: a.name,
                fromModuleName: moduleNameNode.text,
                fromUri: foundModule.uri,
                maintainerAndPackageName: foundModule.maintainerAndPackageName,
                node: a.syntaxNode,
                type: a.type,
            };
        });
    }
}
exports.Imports = Imports;
//# sourceMappingURL=imports.js.map