"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functionNameRegex = new RegExp("[a-zA-Z0-9_]+");
class TreeUtils {
    static getModuleNameNode(tree) {
        const moduleDeclaration = this.findModuleDeclaration(tree);
        if (moduleDeclaration) {
            return this.findFirstNamedChildOfType("upper_case_qid", moduleDeclaration);
        }
    }
    static getModuleExposingListNodes(tree) {
        const moduleNode = TreeUtils.findModuleDeclaration(tree);
        if (moduleNode) {
            return [
                ...TreeUtils.descendantsOfType(moduleNode, "exposed_value"),
                ...TreeUtils.descendantsOfType(moduleNode, "exposed_type"),
            ];
        }
        return [];
    }
    static getModuleNameAndExposing(tree) {
        const moduleDeclaration = this.findModuleDeclaration(tree);
        if (moduleDeclaration) {
            const moduleName = this.findFirstNamedChildOfType("upper_case_qid", moduleDeclaration);
            const exposingList = this.findFirstNamedChildOfType("exposing_list", moduleDeclaration);
            if (exposingList) {
                const exposed = [];
                if (TreeUtils.findFirstNamedChildOfType("double_dot", exposingList)) {
                    if (moduleName) {
                        const functions = TreeUtils.descendantsOfType(tree.rootNode, "value_declaration");
                        if (functions) {
                            functions.forEach((elmFunction) => {
                                const declaration = TreeUtils.findFirstNamedChildOfType("function_declaration_left", elmFunction);
                                if (declaration && declaration.firstNamedChild) {
                                    const functionName = declaration.firstNamedChild.text;
                                    exposed.push({
                                        exposedUnionConstructors: undefined,
                                        name: functionName,
                                        syntaxNode: declaration,
                                        type: "Function",
                                    });
                                }
                            });
                        }
                        const typeAliases = this.findAllTypeAliasDeclarations(tree);
                        if (typeAliases) {
                            typeAliases.forEach((typeAlias) => {
                                const name = TreeUtils.findFirstNamedChildOfType("upper_case_identifier", typeAlias);
                                if (name) {
                                    exposed.push({
                                        exposedUnionConstructors: undefined,
                                        name: name.text,
                                        syntaxNode: typeAlias,
                                        type: "TypeAlias",
                                    });
                                }
                            });
                        }
                        const typeDeclarations = this.findAllTypeDeclarations(tree);
                        if (typeDeclarations) {
                            typeDeclarations.forEach((typeDeclaration) => {
                                const unionConstructors = [];
                                TreeUtils.descendantsOfType(typeDeclaration, "union_variant").forEach((variant) => {
                                    const name = TreeUtils.findFirstNamedChildOfType("upper_case_identifier", variant);
                                    if (name && name.parent) {
                                        unionConstructors.push({
                                            accessibleWithoutPrefix: false,
                                            name: name.text,
                                            syntaxNode: name.parent,
                                        });
                                    }
                                });
                                const typeDeclarationName = TreeUtils.findFirstNamedChildOfType("upper_case_identifier", typeDeclaration);
                                if (typeDeclarationName) {
                                    exposed.push({
                                        exposedUnionConstructors: unionConstructors,
                                        name: typeDeclarationName.text,
                                        syntaxNode: typeDeclaration,
                                        type: "Type",
                                    });
                                }
                            });
                        }
                        return { moduleName: moduleName.text, exposing: exposed };
                    }
                }
                else {
                    const exposedOperators = TreeUtils.descendantsOfType(exposingList, "operator_identifier");
                    for (const value of exposedOperators) {
                        const functionNode = this.findOperator(tree, value.text);
                        if (functionNode) {
                            exposed.push({
                                exposedUnionConstructors: undefined,
                                name: value.text,
                                syntaxNode: functionNode,
                                type: "Operator",
                            });
                        }
                    }
                    const exposedValues = TreeUtils.descendantsOfType(exposingList, "exposed_value");
                    exposed.push(...this.findExposedTopLevelFunctions(tree, exposedValues.map((a) => a.text)));
                    const exposedTypes = TreeUtils.descendantsOfType(exposingList, "exposed_type");
                    for (const value of exposedTypes) {
                        const doubleDot = TreeUtils.descendantsOfType(value, "double_dot");
                        if (doubleDot.length > 0) {
                            const name = TreeUtils.findFirstNamedChildOfType("upper_case_identifier", value);
                            if (name) {
                                const typeDeclaration = this.findTypeDeclaration(tree, name.text);
                                if (typeDeclaration) {
                                    const unionConstructors = [];
                                    TreeUtils.descendantsOfType(typeDeclaration, "union_variant").forEach((variant) => {
                                        const unionConstructorName = TreeUtils.findFirstNamedChildOfType("upper_case_identifier", variant);
                                        if (unionConstructorName && unionConstructorName.parent) {
                                            unionConstructors.push({
                                                accessibleWithoutPrefix: true,
                                                name: unionConstructorName.text,
                                                syntaxNode: unionConstructorName.parent,
                                            });
                                        }
                                    });
                                    exposed.push({
                                        exposedUnionConstructors: unionConstructors,
                                        name: name.text,
                                        syntaxNode: typeDeclaration,
                                        type: "Type",
                                    });
                                }
                            }
                        }
                        else {
                            const typeNode = this.findTypeDeclaration(tree, value.text);
                            if (typeNode) {
                                exposed.push({
                                    exposedUnionConstructors: undefined,
                                    name: value.text,
                                    syntaxNode: typeNode,
                                    type: "Type",
                                });
                            }
                            else {
                                const typeAliasNode = this.findTypeAliasDeclaration(tree, value.text);
                                if (typeAliasNode) {
                                    exposed.push({
                                        exposedUnionConstructors: undefined,
                                        name: value.text,
                                        syntaxNode: typeAliasNode,
                                        type: "TypeAlias",
                                    });
                                }
                            }
                        }
                    }
                    if (moduleName) {
                        return { moduleName: moduleName.text, exposing: exposed };
                    }
                }
            }
        }
    }
    static findFirstNamedChildOfType(type, node) {
        return node.children.find((child) => child.type === type);
    }
    static findAllNamedChildrenOfType(type, node) {
        const result = Array.isArray(type)
            ? node.children.filter((child) => type.includes(child.type))
            : node.children.filter((child) => child.type === type);
        return result.length === 0 ? undefined : result;
    }
    static findExposedFunctionNode(node, functionName) {
        if (node) {
            const exposingList = this.findFirstNamedChildOfType("exposing_list", node);
            if (exposingList) {
                const doubleDot = this.findFirstNamedChildOfType("double_dot", exposingList);
                if (doubleDot) {
                    return undefined;
                }
            }
            const descendants = TreeUtils.descendantsOfType(node, "exposed_value");
            return descendants.find((desc) => desc.text === functionName);
        }
    }
    static isExposedFunction(tree, functionName) {
        const module = this.findModuleDeclaration(tree);
        if (module) {
            const exposingList = this.findFirstNamedChildOfType("exposing_list", module);
            if (exposingList) {
                const doubleDot = this.findFirstNamedChildOfType("double_dot", exposingList);
                if (doubleDot) {
                    return true;
                }
            }
            const descendants = TreeUtils.descendantsOfType(module, "exposed_value");
            return descendants.some((desc) => desc.text === functionName);
        }
        return false;
    }
    static findExposedTypeOrTypeAliasNode(node, typeName) {
        if (node) {
            const exposingList = this.findFirstNamedChildOfType("exposing_list", node);
            if (exposingList) {
                const doubleDot = this.findFirstNamedChildOfType("double_dot", exposingList);
                if (doubleDot) {
                    return undefined;
                }
            }
            const descendants = TreeUtils.descendantsOfType(node, "exposed_type");
            const match = descendants.find((desc) => desc.text.startsWith(typeName));
            if (match && match.firstNamedChild) {
                return match.firstNamedChild;
            }
        }
        return undefined;
    }
    static isExposedTypeOrTypeAlias(tree, typeName) {
        const module = this.findModuleDeclaration(tree);
        if (module) {
            const exposingList = this.findFirstNamedChildOfType("exposing_list", module);
            if (exposingList) {
                const doubleDot = this.findFirstNamedChildOfType("double_dot", exposingList);
                if (doubleDot) {
                    return true;
                }
            }
            const descendants = TreeUtils.descendantsOfType(module, "exposed_type");
            return descendants.some((desc) => desc.text.startsWith(typeName));
        }
        return false;
    }
    static findUnionConstructor(tree, unionConstructorName) {
        const unionVariants = TreeUtils.descendantsOfType(tree.rootNode, "union_variant");
        if (unionVariants.length > 0) {
            return unionVariants.find((a) => a.firstChild !== null &&
                a.firstChild.type === "upper_case_identifier" &&
                a.firstChild.text === unionConstructorName);
        }
    }
    static findUnionConstructorCalls(tree, unionConstructorName) {
        const upperCaseQid = TreeUtils.descendantsOfType(tree.rootNode, "upper_case_qid");
        if (upperCaseQid.length > 0) {
            const result = upperCaseQid.filter((a) => a.firstChild !== null &&
                a.firstChild.type === "upper_case_identifier" &&
                a.firstChild.text === unionConstructorName &&
                a.parent &&
                a.parent.type !== "type_ref");
            return result.length === 0 ? undefined : result;
        }
    }
    static findLetFunctionNodeDefinition(syntaxNode, functionName) {
        var _a;
        if (((_a = syntaxNode.previousNamedSibling) === null || _a === void 0 ? void 0 : _a.type) === "let") {
            const foundFunction = this.findFunction(syntaxNode.previousNamedSibling, functionName, false);
            if (foundFunction) {
                return foundFunction;
            }
        }
        if (syntaxNode.parent && syntaxNode.parent.type === "let") {
            const foundFunction = this.findFunction(syntaxNode, functionName, false);
            if (foundFunction) {
                return foundFunction;
            }
        }
        if (syntaxNode.parent) {
            return this.findLetFunctionNodeDefinition(syntaxNode.parent, functionName);
        }
    }
    static findFunction(syntaxNode, functionName, onlySearchTopLevel = true) {
        const functions = onlySearchTopLevel
            ? syntaxNode.children.filter((a) => a.type === "value_declaration")
            : syntaxNode.descendantsOfType("value_declaration");
        let ret;
        if (functions) {
            ret = functions.find((elmFunction) => {
                const declaration = TreeUtils.findFirstNamedChildOfType("function_declaration_left", elmFunction);
                if (declaration && declaration.firstNamedChild) {
                    return functionName === declaration.firstNamedChild.text;
                }
            });
            if (!ret) {
                functions.forEach((elmFunction) => {
                    var _a;
                    const declaration = TreeUtils.findFirstNamedChildOfType("pattern", elmFunction);
                    if (declaration &&
                        declaration.children[0] &&
                        declaration.children[0].children) {
                        ret = (_a = declaration.children[0].children
                            .find((a) => functionName === a.text)) === null || _a === void 0 ? void 0 : _a.child(0);
                        return;
                    }
                });
            }
            return ret;
        }
    }
    static notUndefined(x) {
        return x !== undefined;
    }
    static findOperator(tree, operatorName) {
        const infixDeclarations = this.findAllNamedChildrenOfType("infix_declaration", tree.rootNode);
        if (infixDeclarations) {
            const operatorNode = infixDeclarations.find((a) => {
                const operator = TreeUtils.findFirstNamedChildOfType("operator_identifier", a);
                if (operator) {
                    return operator.text === operatorName;
                }
                return false;
            });
            if (operatorNode) {
                const functionReference = TreeUtils.findFirstNamedChildOfType("value_expr", operatorNode);
                if (functionReference) {
                    return this.findFunction(tree.rootNode, functionReference.text);
                }
            }
        }
    }
    static findTypeDeclaration(tree, typeName) {
        const types = this.findAllTypeDeclarations(tree);
        if (types) {
            return types.find((a) => a.children.length > 1 &&
                a.children[1].type === "upper_case_identifier" &&
                a.children[1].text === typeName);
        }
    }
    static findModuleDeclaration(tree) {
        return this.findFirstNamedChildOfType("module_declaration", tree.rootNode);
    }
    static findTypeAliasDeclaration(tree, typeAliasName) {
        const typeAliases = this.findAllTypeAliasDeclarations(tree);
        if (typeAliases) {
            return typeAliases.find((a) => a.children.length > 2 &&
                a.children[2].type === "upper_case_identifier" &&
                a.children[2].text === typeAliasName);
        }
    }
    static findAllTopLeverFunctionDeclarations(tree) {
        const result = tree.rootNode.children.filter((a) => a.type === "value_declaration");
        return result.length === 0 ? undefined : result;
    }
    static findAllTypeOrTypeAliasCalls(tree) {
        const result = [];
        const typeRefs = TreeUtils.descendantsOfType(tree.rootNode, "type_ref");
        if (typeRefs.length > 0) {
            typeRefs.forEach((a) => {
                if (a.firstChild &&
                    a.firstChild.type === "upper_case_qid" &&
                    a.firstChild.firstChild) {
                    result.push(a.firstChild);
                }
            });
        }
        return result.length === 0 ? undefined : result;
    }
    static getFunctionNameNodeFromDefinition(node) {
        if (node.type === "lower_case_identifier") {
            return node;
        }
        const declaration = TreeUtils.findFirstNamedChildOfType("function_declaration_left", node);
        if (declaration && declaration.firstNamedChild) {
            return declaration.firstNamedChild;
        }
    }
    static getTypeOrTypeAliasNameNodeFromDefinition(node) {
        return TreeUtils.findFirstNamedChildOfType("upper_case_identifier", node);
    }
    static findTypeOrTypeAliasCalls(tree, typeOrTypeAliasName) {
        const typeOrTypeAliasNodes = this.findAllTypeOrTypeAliasCalls(tree);
        if (typeOrTypeAliasNodes) {
            const result = typeOrTypeAliasNodes.filter((a) => {
                return a.text === typeOrTypeAliasName;
            });
            return result.length === 0 ? undefined : result;
        }
    }
    static findAllTypeDeclarations(tree) {
        return this.findAllNamedChildrenOfType("type_declaration", tree.rootNode);
    }
    static findAllTypeAliasDeclarations(tree) {
        return this.findAllNamedChildrenOfType("type_alias_declaration", tree.rootNode);
    }
    static findUppercaseQidNode(tree, nodeAtPosition) {
        let definitionNode = this.findTypeDeclaration(tree, nodeAtPosition.text);
        if (definitionNode) {
            return { node: definitionNode, nodeType: "Type" };
        }
        definitionNode = this.findTypeAliasDeclaration(tree, nodeAtPosition.text);
        if (definitionNode) {
            return { node: definitionNode, nodeType: "TypeAlias" };
        }
        definitionNode = this.findUnionConstructor(tree, nodeAtPosition.text);
        if (definitionNode) {
            return { node: definitionNode, nodeType: "UnionConstructor" };
        }
    }
    static findDefinitionNodeByReferencingNode(nodeAtPosition, uri, tree, imports) {
        var _a, _b, _c;
        if (nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "upper_case_qid" &&
            nodeAtPosition.parent.previousNamedSibling &&
            nodeAtPosition.parent.previousNamedSibling.type === "module") {
            const moduleNode = nodeAtPosition.parent.parent;
            if (moduleNode) {
                return {
                    node: moduleNode,
                    nodeType: "Module",
                    uri,
                };
            }
        }
        else if (nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "upper_case_qid" &&
            nodeAtPosition.parent.previousNamedSibling &&
            nodeAtPosition.parent.previousNamedSibling.type === "import") {
            const upperCaseQid = nodeAtPosition.parent;
            const definitionFromOtherFile = this.findImportFromImportList(uri, upperCaseQid.text, "Module", imports);
            if (definitionFromOtherFile) {
                return {
                    node: definitionFromOtherFile.node,
                    nodeType: "Module",
                    uri: definitionFromOtherFile.fromUri,
                };
            }
        }
        else if (nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "function_declaration_left") {
            const definitionNode = nodeAtPosition.parent.parent &&
                nodeAtPosition.parent.parent.parent &&
                nodeAtPosition.parent.parent.parent.type === "let"
                ? this.findFunction(nodeAtPosition.parent.parent.parent, nodeAtPosition.text, false)
                : this.findFunction(tree.rootNode, nodeAtPosition.text);
            if (definitionNode) {
                return {
                    node: definitionNode,
                    nodeType: "Function",
                    uri,
                };
            }
        }
        else if ((nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "exposed_value" &&
            nodeAtPosition.parent.parent &&
            nodeAtPosition.parent.parent.parent &&
            nodeAtPosition.parent.parent.parent.type === "module_declaration") ||
            (nodeAtPosition.parent &&
                nodeAtPosition.parent.type === "type_annotation")) {
            const definitionNode = TreeUtils.findFunction(tree.rootNode, nodeAtPosition.text);
            if (definitionNode) {
                return {
                    node: definitionNode,
                    nodeType: "Function",
                    uri,
                };
            }
        }
        else if ((nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "exposed_type" &&
            nodeAtPosition.parent.parent &&
            nodeAtPosition.parent.parent.parent &&
            nodeAtPosition.parent.parent.parent.type === "module_declaration") ||
            (nodeAtPosition.previousNamedSibling &&
                (nodeAtPosition.previousNamedSibling.type === "type" ||
                    nodeAtPosition.previousNamedSibling.type === "alias"))) {
            const definitionNode = TreeUtils.findUppercaseQidNode(tree, nodeAtPosition);
            if (definitionNode) {
                return {
                    node: definitionNode.node,
                    nodeType: definitionNode.nodeType,
                    uri,
                };
            }
        }
        else if (nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "exposed_value" &&
            nodeAtPosition.parent.parent &&
            nodeAtPosition.parent.parent.parent &&
            nodeAtPosition.parent.parent.parent.type === "import_clause") {
            const definitionFromOtherFile = this.findImportFromImportList(uri, nodeAtPosition.text, "Function", imports);
            if (definitionFromOtherFile) {
                return {
                    node: definitionFromOtherFile.node,
                    nodeType: "Function",
                    uri: definitionFromOtherFile.fromUri,
                };
            }
        }
        else if (nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "exposed_type" &&
            nodeAtPosition.parent.parent &&
            nodeAtPosition.parent.parent.parent &&
            nodeAtPosition.parent.parent.parent.type === "import_clause") {
            const upperCaseQid = nodeAtPosition;
            let definitionFromOtherFile = this.findImportFromImportList(uri, upperCaseQid.text, "Type", imports);
            if (definitionFromOtherFile) {
                return {
                    node: definitionFromOtherFile.node,
                    nodeType: "Type",
                    uri: definitionFromOtherFile.fromUri,
                };
            }
            definitionFromOtherFile = this.findImportFromImportList(uri, upperCaseQid.text, "TypeAlias", imports);
            if (definitionFromOtherFile) {
                return {
                    node: definitionFromOtherFile.node,
                    nodeType: "TypeAlias",
                    uri: definitionFromOtherFile.fromUri,
                };
            }
        }
        else if (nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "union_variant") {
            const definitionNode = nodeAtPosition.parent;
            return {
                node: definitionNode,
                nodeType: "UnionConstructor",
                uri,
            };
        }
        else if (nodeAtPosition.parent &&
            nodeAtPosition.parent.type === "upper_case_qid") {
            const upperCaseQid = nodeAtPosition.parent;
            const definitionNode = TreeUtils.findUppercaseQidNode(tree, upperCaseQid);
            let definitionFromOtherFile;
            if (!definitionNode) {
                definitionFromOtherFile = this.findImportFromImportList(uri, upperCaseQid.text, "Type", imports);
                if (definitionFromOtherFile) {
                    return {
                        node: definitionFromOtherFile.node,
                        nodeType: "Type",
                        uri: definitionFromOtherFile.fromUri,
                    };
                }
                definitionFromOtherFile = this.findImportFromImportList(uri, upperCaseQid.text, "TypeAlias", imports);
                if (definitionFromOtherFile) {
                    return {
                        node: definitionFromOtherFile.node,
                        nodeType: "TypeAlias",
                        uri: definitionFromOtherFile.fromUri,
                    };
                }
                definitionFromOtherFile = this.findImportFromImportList(uri, upperCaseQid.text, "UnionConstructor", imports);
                if (definitionFromOtherFile) {
                    return {
                        node: definitionFromOtherFile.node,
                        nodeType: "UnionConstructor",
                        uri: definitionFromOtherFile.fromUri,
                    };
                }
            }
            if (definitionNode) {
                return {
                    node: definitionNode.node,
                    nodeType: definitionNode.nodeType,
                    uri,
                };
            }
        }
        else if (nodeAtPosition.parent &&
            (nodeAtPosition.parent.type === "value_qid" ||
                nodeAtPosition.parent.type === "lower_pattern" ||
                nodeAtPosition.parent.type === "record_base_identifier")) {
            const caseOfParameter = this.findCaseOfParameterDefinition(nodeAtPosition, nodeAtPosition.text);
            if (caseOfParameter) {
                return {
                    node: caseOfParameter,
                    nodeType: "CasePattern",
                    uri,
                };
            }
            const anonymousFunctionDefinition = this.findAnonymousFunctionParameterDefinition(nodeAtPosition, nodeAtPosition.text);
            if (anonymousFunctionDefinition) {
                return {
                    node: anonymousFunctionDefinition,
                    nodeType: "AnonymousFunctionParameter",
                    uri,
                };
            }
            const functionParameter = this.findFunctionParameterDefinition(nodeAtPosition, nodeAtPosition.text);
            if (functionParameter) {
                return {
                    node: functionParameter,
                    nodeType: "FunctionParameter",
                    uri,
                };
            }
            const letDefinitionNode = this.findLetFunctionNodeDefinition(nodeAtPosition, nodeAtPosition.text);
            if (letDefinitionNode) {
                return {
                    node: letDefinitionNode,
                    nodeType: "Function",
                    uri,
                };
            }
            const topLevelDefinitionNode = TreeUtils.findFunction(tree.rootNode, nodeAtPosition.parent.text);
            if (!topLevelDefinitionNode) {
                const definitionFromOtherFile = this.findImportFromImportList(uri, nodeAtPosition.parent.text, "Function", imports);
                if (definitionFromOtherFile) {
                    return {
                        node: definitionFromOtherFile.node,
                        nodeType: "Function",
                        uri: definitionFromOtherFile.fromUri,
                    };
                }
            }
            if (topLevelDefinitionNode) {
                return {
                    node: topLevelDefinitionNode,
                    nodeType: "Function",
                    uri,
                };
            }
        }
        else if (nodeAtPosition.type === "operator_identifier") {
            const definitionNode = TreeUtils.findOperator(tree, nodeAtPosition.text);
            if (!definitionNode) {
                const definitionFromOtherFile = this.findImportFromImportList(uri, nodeAtPosition.text, "Operator", imports);
                if (definitionFromOtherFile) {
                    return {
                        node: definitionFromOtherFile.node,
                        nodeType: "Operator",
                        uri: definitionFromOtherFile.fromUri,
                    };
                }
            }
            if (definitionNode) {
                return { node: definitionNode, uri, nodeType: "Operator" };
            }
        }
        else if (((_b = (_a = nodeAtPosition.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.type) === "field_access_expr") {
            const variableNodes = this.descendantsOfType(nodeAtPosition.parent.parent, "lower_case_identifier");
            if (variableNodes.length > 0) {
                const variableRef = TreeUtils.findDefinitionNodeByReferencingNode(variableNodes[0], uri, tree, imports);
                const variableDef = TreeUtils.getTypeOrTypeAliasOfFunctionParameter(variableRef === null || variableRef === void 0 ? void 0 : variableRef.node);
                if ((_c = variableDef === null || variableDef === void 0 ? void 0 : variableDef.firstNamedChild) === null || _c === void 0 ? void 0 : _c.firstNamedChild) {
                    const variableType = TreeUtils.findDefinitionNodeByReferencingNode(variableDef.firstNamedChild.firstNamedChild, uri, tree, imports);
                    const fieldName = nodeAtPosition.text;
                    if (variableType) {
                        const fieldNode = TreeUtils.descendantsOfType(variableType.node, "field_type").find((f) => {
                            var _a;
                            return ((_a = f.firstNamedChild) === null || _a === void 0 ? void 0 : _a.text) === fieldName;
                        });
                        if (fieldNode) {
                            return {
                                node: fieldNode,
                                nodeType: "FieldType",
                                uri: variableType.uri,
                            };
                        }
                    }
                }
            }
        }
    }
    static findFunctionParameterDefinition(node, functionParameterName) {
        if (node.parent) {
            if (node.parent.type === "value_declaration" &&
                node.parent.firstChild &&
                node.parent.firstChild.type === "function_declaration_left") {
                if (node.parent.firstChild) {
                    const match = this.descendantsOfType(node.parent.firstChild, "lower_pattern").find((a) => a.text === functionParameterName);
                    if (match) {
                        return match;
                    }
                    else {
                        return this.findFunctionParameterDefinition(node.parent, functionParameterName);
                    }
                }
            }
            else {
                return this.findFunctionParameterDefinition(node.parent, functionParameterName);
            }
        }
    }
    static findAnonymousFunctionParameterDefinition(node, functionParameterName) {
        if (node && node.type === "parenthesized_expr") {
            const anonymousFunctionExprNodes = this.descendantsOfType(node, "anonymous_function_expr");
            const match = anonymousFunctionExprNodes
                .flatMap((a) => a.children)
                .find((child) => child.type === "pattern" && child.text === functionParameterName);
            if (match) {
                return match;
            }
        }
        if (node.parent) {
            return this.findAnonymousFunctionParameterDefinition(node.parent, functionParameterName);
        }
    }
    static findCaseOfParameterDefinition(node, caseParameterName) {
        if (node.parent) {
            if (node.parent.type === "case_of_branch" &&
                node.parent.firstChild &&
                node.parent.firstChild.firstChild &&
                node.parent.firstChild.type === "pattern") {
                if (node.parent.firstChild) {
                    const match = node.parent.firstChild.firstChild.children.find((a) => a.type === "lower_pattern" && a.text === caseParameterName);
                    if (match) {
                        return match;
                    }
                    else {
                        return this.findCaseOfParameterDefinition(node.parent, caseParameterName);
                    }
                }
            }
            else {
                return this.findCaseOfParameterDefinition(node.parent, caseParameterName);
            }
        }
    }
    static findImportFromImportList(uri, nodeName, type, imports) {
        if (imports.imports) {
            const allFileImports = imports.imports[uri];
            if (allFileImports) {
                const foundNode = allFileImports.find((a) => a.alias === nodeName && a.type === type);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
    }
    static findImportClauseByName(tree, moduleName) {
        const allImports = this.findAllImportNameNodes(tree);
        if (allImports) {
            return allImports.find((a) => a.children.length > 1 &&
                a.children[1].type === "upper_case_qid" &&
                a.children[1].text === moduleName);
        }
    }
    static findImportNameNode(tree, moduleName) {
        const allImports = this.findAllImportNameNodes(tree);
        if (allImports) {
            const match = allImports.find((a) => a.children.length > 1 &&
                a.children[1].type === "upper_case_qid" &&
                a.children[1].text === moduleName);
            if (match) {
                return match.children[1];
            }
        }
    }
    static getTypeOrTypeAliasOfFunctionParameter(node) {
        if (node &&
            node.parent &&
            node.parent.parent &&
            node.parent.parent.previousNamedSibling &&
            node.parent.parent.previousNamedSibling.type === "type_annotation" &&
            node.parent.parent.previousNamedSibling.lastNamedChild) {
            const functionParameterNodes = TreeUtils.findAllNamedChildrenOfType(["pattern", "lower_pattern"], node.parent);
            if (functionParameterNodes) {
                const matchIndex = functionParameterNodes.findIndex((a) => a.text === node.text);
                const typeAnnotationNodes = TreeUtils.findAllNamedChildrenOfType(["type_ref", "type_expression"], node.parent.parent.previousNamedSibling.lastNamedChild);
                if (typeAnnotationNodes) {
                    return typeAnnotationNodes[matchIndex];
                }
            }
        }
    }
    static getReturnTypeOrTypeAliasOfFunctionDefinition(node) {
        var _a, _b, _c;
        if (node && ((_a = node.previousNamedSibling) === null || _a === void 0 ? void 0 : _a.type) === "type_annotation") {
            const typeAnnotationNodes = TreeUtils.descendantsOfType(node.previousNamedSibling, "type_ref");
            if (typeAnnotationNodes) {
                const type = typeAnnotationNodes[typeAnnotationNodes.length - 1];
                return (_c = (_b = type.firstNamedChild) === null || _b === void 0 ? void 0 : _b.firstNamedChild) !== null && _c !== void 0 ? _c : type;
            }
        }
    }
    static getTypeOrTypeAliasOfFunctionRecordParameter(node, tree, imports, uri) {
        var _a, _b, _c;
        if (((_a = node === null || node === void 0 ? void 0 : node.parent) === null || _a === void 0 ? void 0 : _a.type) === "function_call_expr" &&
            node.parent.firstNamedChild) {
            const parameterIndex = node.parent.namedChildren.map((c) => c.text).indexOf(node.text) - 1;
            const functionName = TreeUtils.descendantsOfType(node.parent.firstNamedChild, "lower_case_identifier");
            const functionDefinition = TreeUtils.findDefinitionNodeByReferencingNode(functionName[functionName.length - 1], uri, tree, imports);
            if ((_b = functionDefinition === null || functionDefinition === void 0 ? void 0 : functionDefinition.node.previousNamedSibling) === null || _b === void 0 ? void 0 : _b.lastNamedChild) {
                const typeAnnotationNodes = TreeUtils.findAllNamedChildrenOfType(["type_ref", "record_type"], functionDefinition.node.previousNamedSibling.lastNamedChild);
                if (typeAnnotationNodes) {
                    const typeNode = typeAnnotationNodes[parameterIndex];
                    if ((typeNode === null || typeNode === void 0 ? void 0 : typeNode.type) === "type_ref") {
                        const typeNodes = TreeUtils.descendantsOfType(typeNode, "upper_case_identifier");
                        if (typeNodes.length > 0) {
                            return (_c = TreeUtils.findDefinitionNodeByReferencingNode(typeNodes[0], uri, tree, imports)) === null || _c === void 0 ? void 0 : _c.node;
                        }
                    }
                    else {
                        return typeNode || undefined;
                    }
                }
            }
        }
    }
    static getTypeAliasOfRecordField(node, tree, imports, uri) {
        var _a, _b, _c, _d;
        const fieldName = (_b = (_a = node === null || node === void 0 ? void 0 : node.parent) === null || _a === void 0 ? void 0 : _a.firstNamedChild) === null || _b === void 0 ? void 0 : _b.text;
        let recordType = TreeUtils.getTypeAliasOfRecord(node, tree, imports, uri);
        while (!recordType && ((_c = node === null || node === void 0 ? void 0 : node.parent) === null || _c === void 0 ? void 0 : _c.parent)) {
            node = node.parent.parent;
            recordType = TreeUtils.getTypeAliasOfRecordField(node, tree, imports, uri);
        }
        if (recordType) {
            const fieldTypes = TreeUtils.descendantsOfType(recordType, "field_type");
            const fieldNode = fieldTypes.find((a) => {
                var _a;
                return (((_a = TreeUtils.findFirstNamedChildOfType("lower_case_identifier", a)) === null || _a === void 0 ? void 0 : _a.text) === fieldName);
            });
            if (fieldNode) {
                const typeExpression = TreeUtils.findFirstNamedChildOfType("type_expression", fieldNode);
                if (typeExpression) {
                    const typeNode = TreeUtils.descendantsOfType(typeExpression, "upper_case_identifier");
                    if (typeNode.length > 0) {
                        return (_d = TreeUtils.findDefinitionNodeByReferencingNode(typeNode[0], uri, tree, imports)) === null || _d === void 0 ? void 0 : _d.node;
                    }
                }
            }
        }
    }
    static getTypeAliasOfRecord(node, tree, imports, uri) {
        var _a, _b, _c, _d, _e;
        if ((_a = node === null || node === void 0 ? void 0 : node.parent) === null || _a === void 0 ? void 0 : _a.parent) {
            let type = (_b = TreeUtils.findFirstNamedChildOfType("record_base_identifier", node.parent.parent)) !== null && _b !== void 0 ? _b : TreeUtils.findFirstNamedChildOfType("record_base_identifier", node.parent);
            // Handle records of function returns
            if (!type && node.parent.parent.parent) {
                type = (_d = (_c = TreeUtils.getReturnTypeOrTypeAliasOfFunctionDefinition(node.parent.parent.parent)) === null || _c === void 0 ? void 0 : _c.parent) !== null && _d !== void 0 ? _d : undefined;
            }
            if (type && type.firstNamedChild) {
                const definitionNode = TreeUtils.findDefinitionNodeByReferencingNode(type.firstNamedChild, uri, tree, imports);
                if (definitionNode) {
                    let aliasNode;
                    if (definitionNode.nodeType === "FunctionParameter") {
                        aliasNode = TreeUtils.getTypeOrTypeAliasOfFunctionParameter(definitionNode.node);
                    }
                    else if (definitionNode.nodeType === "Function") {
                        aliasNode = TreeUtils.getReturnTypeOrTypeAliasOfFunctionDefinition(definitionNode.node);
                    }
                    else if (definitionNode.nodeType === "TypeAlias") {
                        aliasNode = definitionNode.node;
                    }
                    if (aliasNode) {
                        const childNode = TreeUtils.descendantsOfType(aliasNode, "upper_case_identifier");
                        if (childNode.length > 0) {
                            return (_e = TreeUtils.findDefinitionNodeByReferencingNode(childNode[0], uri, tree, imports)) === null || _e === void 0 ? void 0 : _e.node;
                        }
                    }
                }
            }
        }
    }
    static getAllFieldsFromTypeAlias(node) {
        const result = [];
        if (node) {
            const fieldTypes = TreeUtils.descendantsOfType(node, "field_type");
            if (fieldTypes.length > 0) {
                fieldTypes.forEach((a) => {
                    const fieldName = TreeUtils.findFirstNamedChildOfType("lower_case_identifier", a);
                    const typeExpression = TreeUtils.findFirstNamedChildOfType("type_expression", a);
                    if (fieldName && typeExpression) {
                        result.push({ field: fieldName.text, type: typeExpression.text });
                    }
                });
            }
        }
        return result.length === 0 ? undefined : result;
    }
    static descendantsOfType(node, type) {
        return node.descendantsOfType(type);
    }
    static getNamedDescendantForPosition(node, position) {
        const previousCharColumn = position.character === 0 ? 0 : position.character - 1;
        const charBeforeCursor = node.text
            .split("\n")[position.line].substring(previousCharColumn, position.character);
        if (!functionNameRegex.test(charBeforeCursor)) {
            return node.namedDescendantForPosition({
                column: position.character,
                row: position.line,
            });
        }
        else {
            return node.namedDescendantForPosition({
                column: previousCharColumn,
                row: position.line,
            }, {
                column: position.character,
                row: position.line,
            });
        }
    }
    static getNamedDescendantForLineBeforePosition(node, position) {
        const previousLine = position.line === 0 ? 0 : position.line - 1;
        return node.namedDescendantForPosition({
            column: 0,
            row: previousLine,
        });
    }
    static getNamedDescendantForLineAfterPosition(node, position) {
        const followingLine = position.line + 1;
        return node.namedDescendantForPosition({
            column: 0,
            row: followingLine,
        });
    }
    static findParentOfType(typeToLookFor, node) {
        if (node.type === typeToLookFor) {
            return node;
        }
        if (node.parent) {
            return this.findParentOfType(typeToLookFor, node.parent);
        }
    }
    static getLastImportNode(tree) {
        const allImportNodes = this.findAllImportNameNodes(tree);
        if (allImportNodes === null || allImportNodes === void 0 ? void 0 : allImportNodes.length) {
            return allImportNodes[allImportNodes.length - 1];
        }
    }
    static isReferenceFullyQualified(node) {
        var _a, _b, _c;
        return (((_a = node.previousNamedSibling) === null || _a === void 0 ? void 0 : _a.type) === "dot" &&
            ((_c = (_b = node.previousNamedSibling) === null || _b === void 0 ? void 0 : _b.previousNamedSibling) === null || _c === void 0 ? void 0 : _c.type) ===
                "upper_case_identifier");
    }
    static findExposedTopLevelFunctions(tree, functionNamesToFind) {
        return tree.rootNode.children
            .filter((node) => node.type === "value_declaration" &&
            node.namedChildren.some((a) => a.type === "function_declaration_left"))
            .map((node) => node.namedChildren.find((child) => {
            var _a;
            return child.type === "function_declaration_left" && ((_a = child.firstNamedChild) === null || _a === void 0 ? void 0 : _a.text);
        }))
            .filter(this.notUndefined)
            .map((node) => {
            var _a;
            return { node, text: (_a = node.firstNamedChild) === null || _a === void 0 ? void 0 : _a.text };
        })
            .filter((node) => functionNamesToFind.includes(node.text))
            .map((functionNode) => {
            return {
                exposedUnionConstructors: undefined,
                name: functionNode.text,
                syntaxNode: functionNode.node.parent,
                type: "Function",
            };
        });
    }
    // tslint:disable-next-line: no-identical-functions
    static findAllImportNameNodes(tree) {
        const result = tree.rootNode.children.filter((a) => a.type === "import_clause");
        return result.length === 0 ? undefined : result;
    }
}
exports.TreeUtils = TreeUtils;
//# sourceMappingURL=treeUtils.js.map