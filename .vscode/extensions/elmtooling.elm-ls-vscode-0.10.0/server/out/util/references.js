"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const treeUtils_1 = require("./treeUtils");
class References {
    static find(definitionNode, forest, imports) {
        const references = [];
        if (definitionNode) {
            const refSourceTree = forest.getByUri(definitionNode.uri);
            if (refSourceTree) {
                const moduleNameNode = treeUtils_1.TreeUtils.getModuleNameNode(refSourceTree.tree);
                switch (definitionNode.nodeType) {
                    case "Function":
                        const annotationNameNode = this.getFunctionAnnotationNameNodeFromDefinition(definitionNode.node);
                        if (annotationNameNode && refSourceTree.writeable) {
                            references.push({
                                node: annotationNameNode,
                                uri: definitionNode.uri,
                            });
                        }
                        const functionNameNode = treeUtils_1.TreeUtils.getFunctionNameNodeFromDefinition(definitionNode.node);
                        if (functionNameNode) {
                            if (refSourceTree.writeable) {
                                references.push({
                                    node: functionNameNode,
                                    uri: definitionNode.uri,
                                });
                            }
                            const localFunctions = definitionNode.node.parent &&
                                definitionNode.node.parent.type === "let" &&
                                definitionNode.node.parent.nextNamedSibling
                                ? this.findFunctionCalls(definitionNode.node.parent.nextNamedSibling, functionNameNode.text)
                                : this.findFunctionCalls(refSourceTree.tree.rootNode, functionNameNode.text);
                            if (localFunctions && refSourceTree.writeable) {
                                references.push(...localFunctions.map((node) => {
                                    return { node, uri: definitionNode.uri };
                                }));
                            }
                            if (treeUtils_1.TreeUtils.isExposedFunction(refSourceTree.tree, functionNameNode.text)) {
                                const moduleDeclarationNode = treeUtils_1.TreeUtils.findModuleDeclaration(refSourceTree.tree);
                                if (moduleDeclarationNode) {
                                    const exposedNode = treeUtils_1.TreeUtils.findExposedFunctionNode(moduleDeclarationNode, functionNameNode.text);
                                    if (exposedNode && refSourceTree.writeable) {
                                        references.push({
                                            node: exposedNode,
                                            uri: definitionNode.uri,
                                        });
                                    }
                                }
                                if (moduleNameNode) {
                                    for (const uri in imports.imports) {
                                        if (imports.imports.hasOwnProperty(uri)) {
                                            const element = imports.imports[uri];
                                            const needsToBeChecked = element.filter((a) => uri !== definitionNode.uri &&
                                                a.fromModuleName === moduleNameNode.text &&
                                                a.type === "Function" &&
                                                (a.alias.endsWith(`.${functionNameNode.text}`) ||
                                                    a.alias === functionNameNode.text));
                                            if (needsToBeChecked.length > 0) {
                                                const treeToCheck = forest.getByUri(uri);
                                                if (treeToCheck && treeToCheck.writeable) {
                                                    const importClauseNode = treeUtils_1.TreeUtils.findImportClauseByName(treeToCheck.tree, moduleNameNode.text);
                                                    if (importClauseNode) {
                                                        const exposedNode = treeUtils_1.TreeUtils.findExposedFunctionNode(importClauseNode, functionNameNode.text);
                                                        if (exposedNode) {
                                                            references.push({
                                                                node: exposedNode,
                                                                uri,
                                                            });
                                                        }
                                                    }
                                                    needsToBeChecked.forEach((a) => {
                                                        const functions = this.findFunctionCalls(treeToCheck.tree.rootNode, a.alias);
                                                        if (functions) {
                                                            references.push(...functions.map((node) => {
                                                                return { node, uri };
                                                            }));
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case "Type":
                    case "TypeAlias":
                        const typeOrTypeAliasNameNode = treeUtils_1.TreeUtils.getTypeOrTypeAliasNameNodeFromDefinition(definitionNode.node);
                        if (typeOrTypeAliasNameNode) {
                            if (refSourceTree.writeable) {
                                references.push({
                                    node: typeOrTypeAliasNameNode,
                                    uri: definitionNode.uri,
                                });
                            }
                            const localFunctions = treeUtils_1.TreeUtils.findTypeOrTypeAliasCalls(refSourceTree.tree, typeOrTypeAliasNameNode.text);
                            if (localFunctions && refSourceTree.writeable) {
                                references.push(...localFunctions.map((node) => {
                                    return { node, uri: definitionNode.uri };
                                }));
                            }
                            if (treeUtils_1.TreeUtils.isExposedTypeOrTypeAlias(refSourceTree.tree, typeOrTypeAliasNameNode.text)) {
                                const moduleDeclarationNode = treeUtils_1.TreeUtils.findModuleDeclaration(refSourceTree.tree);
                                if (moduleDeclarationNode) {
                                    const exposedNode = treeUtils_1.TreeUtils.findExposedTypeOrTypeAliasNode(moduleDeclarationNode, typeOrTypeAliasNameNode.text);
                                    if (exposedNode && refSourceTree.writeable) {
                                        references.push({
                                            node: exposedNode,
                                            uri: definitionNode.uri,
                                        });
                                    }
                                }
                                if (moduleNameNode) {
                                    for (const uri in imports.imports) {
                                        if (imports.imports.hasOwnProperty(uri)) {
                                            const element = imports.imports[uri];
                                            const needsToBeChecked = element.filter((a) => uri !== definitionNode.uri &&
                                                a.fromModuleName === moduleNameNode.text &&
                                                (a.type === "Type" || a.type === "TypeAlias") &&
                                                (a.alias.endsWith(`.${typeOrTypeAliasNameNode.text}`) ||
                                                    a.alias === typeOrTypeAliasNameNode.text));
                                            if (needsToBeChecked.length > 0) {
                                                const treeToCheck = forest.getByUri(uri);
                                                if (treeToCheck && treeToCheck.writeable) {
                                                    const importClauseNode = treeUtils_1.TreeUtils.findImportClauseByName(treeToCheck.tree, moduleNameNode.text);
                                                    if (importClauseNode) {
                                                        const exposedNode = treeUtils_1.TreeUtils.findExposedTypeOrTypeAliasNode(importClauseNode, typeOrTypeAliasNameNode.text);
                                                        if (exposedNode) {
                                                            references.push({
                                                                node: exposedNode,
                                                                uri,
                                                            });
                                                        }
                                                    }
                                                    needsToBeChecked.forEach((a) => {
                                                        const typeOrTypeAliasCalls = treeUtils_1.TreeUtils.findTypeOrTypeAliasCalls(treeToCheck.tree, a.alias);
                                                        if (typeOrTypeAliasCalls) {
                                                            references.push(...typeOrTypeAliasCalls.map((node) => {
                                                                return { node, uri };
                                                            }));
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case "Module":
                        if (moduleNameNode) {
                            if (refSourceTree.writeable) {
                                references.push({
                                    node: moduleNameNode,
                                    uri: definitionNode.uri,
                                });
                            }
                            for (const uri in imports.imports) {
                                if (imports.imports.hasOwnProperty(uri)) {
                                    const element = imports.imports[uri];
                                    const needsToBeChecked = element.filter((a) => uri !== definitionNode.uri &&
                                        a.fromModuleName === moduleNameNode.text);
                                    if (needsToBeChecked.length > 0) {
                                        const treeToCheck = forest.getByUri(uri);
                                        if (treeToCheck && treeToCheck.writeable) {
                                            needsToBeChecked.forEach((a) => {
                                                const importNameNode = treeUtils_1.TreeUtils.findImportNameNode(treeToCheck.tree, a.alias);
                                                if (importNameNode) {
                                                    references.push({ node: importNameNode, uri });
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case "FunctionParameter":
                        if (refSourceTree.writeable) {
                            references.push({
                                node: definitionNode.node,
                                uri: definitionNode.uri,
                            });
                            const valueDeclaration = treeUtils_1.TreeUtils.findParentOfType("function_declaration_left", definitionNode.node);
                            if (valueDeclaration &&
                                valueDeclaration.nextNamedSibling &&
                                valueDeclaration.nextNamedSibling.nextNamedSibling) {
                                const functionBody = valueDeclaration.nextNamedSibling.nextNamedSibling;
                                if (functionBody) {
                                    const parameters = this.findParameterUsage(functionBody, definitionNode.node.text);
                                    if (parameters) {
                                        references.push(...parameters.map((node) => {
                                            return { node, uri: definitionNode.uri };
                                        }));
                                    }
                                }
                            }
                        }
                        break;
                    case "CasePattern":
                        if (refSourceTree.writeable) {
                            references.push({
                                node: definitionNode.node,
                                uri: definitionNode.uri,
                            });
                            if (definitionNode.node.parent &&
                                definitionNode.node.parent.parent &&
                                definitionNode.node.parent.parent.parent &&
                                definitionNode.node.parent.parent.parent.lastNamedChild) {
                                const caseBody = definitionNode.node.parent.parent.parent.lastNamedChild;
                                if (caseBody) {
                                    const parameters = this.findParameterUsage(caseBody, definitionNode.node.text);
                                    if (parameters) {
                                        references.push(...parameters.map((node) => {
                                            return { node, uri: definitionNode.uri };
                                        }));
                                    }
                                }
                            }
                        }
                        break;
                    case "AnonymousFunctionParameter":
                        if (refSourceTree.writeable) {
                            references.push({
                                node: definitionNode.node,
                                uri: definitionNode.uri,
                            });
                            if (definitionNode.node.parent &&
                                definitionNode.node.parent.parent) {
                                const anonymousFunction = definitionNode.node.parent.parent; // TODO this is due to tree sitter matching wrong
                                if (anonymousFunction) {
                                    const parameters = this.findParameterUsage(anonymousFunction, definitionNode.node.text);
                                    if (parameters) {
                                        references.push(...parameters.map((node) => {
                                            return { node, uri: definitionNode.uri };
                                        }));
                                    }
                                }
                            }
                        }
                        break;
                    case "UnionConstructor":
                        if (definitionNode.node.firstChild && moduleNameNode) {
                            const nameNode = definitionNode.node.firstChild;
                            if (refSourceTree.writeable) {
                                references.push({
                                    node: nameNode,
                                    uri: definitionNode.uri,
                                });
                                const unionConstructorCalls = treeUtils_1.TreeUtils.findUnionConstructorCalls(refSourceTree.tree, nameNode.text);
                                if (unionConstructorCalls) {
                                    references.push(...unionConstructorCalls.map((a) => {
                                        return { node: a, uri: definitionNode.uri };
                                    }));
                                }
                            }
                            for (const uri in imports.imports) {
                                if (imports.imports.hasOwnProperty(uri)) {
                                    const element = imports.imports[uri];
                                    const needsToBeChecked = element.filter((a) => uri !== definitionNode.uri &&
                                        a.fromModuleName === moduleNameNode.text &&
                                        a.type === "UnionConstructor" &&
                                        (a.alias.endsWith(`.${nameNode.text}`) ||
                                            a.alias === nameNode.text));
                                    if (needsToBeChecked.length > 0) {
                                        const treeToCheck = forest.getByUri(uri);
                                        if (treeToCheck && treeToCheck.writeable) {
                                            const unionConstructorCallsFromOtherFiles = treeUtils_1.TreeUtils.findUnionConstructorCalls(treeToCheck.tree, nameNode.text);
                                            if (unionConstructorCallsFromOtherFiles) {
                                                references.push(...unionConstructorCallsFromOtherFiles.map((node) => {
                                                    return { node, uri };
                                                }));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        return references;
    }
    static findFunctionCalls(node, functionName) {
        const functions = this.findAllFunctionCallsAndParameters(node);
        const result = functions
            .filter((a) => a.text === functionName)
            .map((a) => a.lastChild);
        return result.length === 0 ? undefined : result;
    }
    static findAllFunctionCallsAndParameters(node) {
        let functions = treeUtils_1.TreeUtils.descendantsOfType(node, "value_expr");
        if (functions.length > 0) {
            functions = functions
                .filter((a) => a.firstChild && a.firstChild.type === "value_qid")
                .map((a) => a.firstChild);
        }
        return functions;
    }
    static findParameterUsage(node, functionName) {
        const parameters = [
            ...this.findAllFunctionCallsAndParameters(node),
            ...this.findAllRecordBaseIdentifiers(node),
        ];
        const result = parameters.filter((a) => a.text === functionName);
        return result.length === 0 ? undefined : result;
    }
    static findAllRecordBaseIdentifiers(node) {
        return treeUtils_1.TreeUtils.descendantsOfType(node, "record_base_identifier");
    }
    static getFunctionAnnotationNameNodeFromDefinition(node) {
        if (node.previousNamedSibling &&
            node.previousNamedSibling.type === "type_annotation" &&
            node.previousNamedSibling.firstChild &&
            node.previousNamedSibling.firstChild.type === "lower_case_identifier") {
            return node.previousNamedSibling.firstChild;
        }
    }
}
exports.References = References;
//# sourceMappingURL=references.js.map