"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const elmUtils_1 = require("../util/elmUtils");
const elmWorkspaceMatcher_1 = require("../util/elmWorkspaceMatcher");
const hintHelper_1 = require("../util/hintHelper");
const treeUtils_1 = require("../util/treeUtils");
const ranking_1 = __importDefault(require("./ranking"));
class CompletionProvider {
    constructor(connection, elmWorkspaces) {
        this.connection = connection;
        this.qidRegex = /[a-zA-Z0-9\.]+/;
        this.qidAtStartOfLineRegex = /^[a-zA-Z0-9 \.]*$/;
        this.handleCompletionRequest = (params, elmWorkspace) => {
            this.connection.console.info(`A completion was requested`);
            const completions = [];
            const forest = elmWorkspace.getForest();
            const tree = forest.getTree(params.textDocument.uri);
            if (tree) {
                const nodeAtPosition = treeUtils_1.TreeUtils.getNamedDescendantForPosition(tree.rootNode, params.position);
                const nodeAtLineBefore = treeUtils_1.TreeUtils.getNamedDescendantForLineBeforePosition(tree.rootNode, params.position);
                const nodeAtLineAfter = treeUtils_1.TreeUtils.getNamedDescendantForLineAfterPosition(tree.rootNode, params.position);
                const targetLine = tree.rootNode.text.split("\n")[params.position.line];
                let currentCharacter = params.position.character;
                while (currentCharacter - 1 >= 0 &&
                    this.qidRegex.test(targetLine[currentCharacter - 1])) {
                    currentCharacter--;
                }
                const replaceRange = vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(params.position.line, currentCharacter), params.position);
                const previousWord = this.findPreviousWord(currentCharacter, targetLine);
                const isAtStartOfLine = this.qidAtStartOfLineRegex.test(targetLine.slice(0, params.position.character - 1));
                if (isAtStartOfLine &&
                    nodeAtLineBefore.type === "lower_case_identifier" &&
                    nodeAtLineBefore.parent &&
                    nodeAtLineBefore.parent.type === "type_annotation") {
                    return [
                        this.createCompletion(undefined, vscode_languageserver_1.CompletionItemKind.Text, nodeAtLineBefore.text, replaceRange, "a"),
                    ];
                }
                else if (isAtStartOfLine &&
                    nodeAtLineAfter.type === "lower_case_identifier" &&
                    nodeAtLineAfter.parent &&
                    (nodeAtLineAfter.parent.type === "value_qid" ||
                        nodeAtLineAfter.parent.type === "function_declaration_left")) {
                    return [
                        this.createCompletion(undefined, vscode_languageserver_1.CompletionItemKind.Text, nodeAtLineAfter.text, replaceRange, "a"),
                    ];
                }
                else if (previousWord && previousWord === "module") {
                    return undefined;
                }
                else if (nodeAtPosition.parent &&
                    nodeAtPosition.parent.type === "module_declaration" &&
                    nodeAtPosition &&
                    nodeAtPosition.type === "exposing_list") {
                    return this.getSameFileTopLevelCompletions(tree, replaceRange, true);
                }
                else if (nodeAtPosition.parent &&
                    nodeAtPosition.parent.type === "exposing_list" &&
                    nodeAtPosition.parent.parent &&
                    nodeAtPosition.parent.parent.type === "module_declaration" &&
                    nodeAtPosition &&
                    (nodeAtPosition.type === "comma" ||
                        nodeAtPosition.type === "right_parenthesis")) {
                    return this.getSameFileTopLevelCompletions(tree, replaceRange, true);
                }
                else if (previousWord && previousWord === "import") {
                    return this.getImportableModules(forest, replaceRange);
                }
                else if (nodeAtPosition.parent &&
                    nodeAtPosition.parent.type === "exposing_list" &&
                    nodeAtPosition.parent.parent &&
                    nodeAtPosition.parent.parent.type === "import_clause" &&
                    nodeAtPosition.parent.firstNamedChild &&
                    nodeAtPosition.parent.firstNamedChild.type === "exposing") {
                    return this.getExposedFromModule(forest, nodeAtPosition.parent, replaceRange);
                }
                else if ((nodeAtPosition.type === "comma" ||
                    nodeAtPosition.type === "right_parenthesis") &&
                    nodeAtPosition.parent &&
                    nodeAtPosition.parent.type === "ERROR" &&
                    nodeAtPosition.parent.parent &&
                    nodeAtPosition.parent.parent.type === "exposing_list") {
                    return this.getExposedFromModule(forest, nodeAtPosition.parent.parent, replaceRange);
                }
                completions.push(...this.getSameFileTopLevelCompletions(tree, replaceRange));
                completions.push(...this.findDefinitionsForScope(nodeAtPosition, tree, replaceRange));
                completions.push(...this.getCompletionsFromOtherFile(elmWorkspace.getImports(), params.textDocument.uri, replaceRange));
                completions.push(...this.createSnippets());
                return completions;
            }
        };
        connection.onCompletion(new elmWorkspaceMatcher_1.ElmWorkspaceMatcher(elmWorkspaces, (param) => vscode_uri_1.URI.parse(param.textDocument.uri)).handlerForWorkspace(this.handleCompletionRequest));
    }
    findPreviousWord(currentCharacter, targetLine) {
        currentCharacter--;
        const previousWordEnd = currentCharacter;
        while (currentCharacter - 1 >= 0 &&
            this.qidRegex.test(targetLine[currentCharacter - 1])) {
            currentCharacter--;
        }
        return targetLine.slice(currentCharacter, previousWordEnd);
    }
    getImportableModules(forest, range) {
        return forest.treeIndex
            .filter(a => a.moduleName)
            .map(a => this.createModuleCompletion(a.moduleName, range, "b"));
    }
    getExposedFromModule(forest, exposingListNode, range) {
        // Skip as clause to always get Module Name
        if (exposingListNode.previousNamedSibling &&
            exposingListNode.previousNamedSibling.type === "as_clause" &&
            exposingListNode.previousNamedSibling.previousNamedSibling) {
            exposingListNode = exposingListNode.previousNamedSibling;
        }
        if (exposingListNode.previousNamedSibling &&
            exposingListNode.previousNamedSibling.type === "upper_case_qid") {
            const prefix = "c";
            const moduleName = exposingListNode.previousNamedSibling.text;
            const exposedByModule = forest.getExposingByModuleName(moduleName);
            if (exposedByModule) {
                return exposedByModule.flatMap(a => {
                    const value = hintHelper_1.HintHelper.createHint(a.syntaxNode);
                    switch (a.type) {
                        case "TypeAlias":
                            return this.createTypeAliasCompletion(value, a.name, range, prefix);
                        case "Type":
                            return a.exposedUnionConstructors
                                ? [
                                    this.createTypeCompletion(value, `${a.name}(..)`, range, prefix),
                                    this.createTypeCompletion(value, a.name, range, prefix),
                                ]
                                : this.createTypeCompletion(value, a.name, range, prefix);
                        default:
                            return this.createFunctionCompletion(value, a.name, range, prefix);
                    }
                });
            }
        }
    }
    getCompletionsFromOtherFile(imports, uri, range) {
        const completions = [];
        if (imports.imports && imports.imports[uri]) {
            const importList = imports.imports[uri];
            importList.forEach(element => {
                const value = hintHelper_1.HintHelper.createHint(element.node);
                let prefix = "d";
                if (element.maintainerAndPackageName) {
                    const matchedRanking = ranking_1.default[element.maintainerAndPackageName];
                    if (matchedRanking) {
                        prefix = `e${matchedRanking}`;
                    }
                }
                switch (element.type) {
                    case "Function":
                        completions.push(this.createFunctionCompletion(value, element.alias, range, prefix));
                        break;
                    case "UnionConstructor":
                        completions.push(this.createUnionConstructorCompletion(element.alias, range, prefix));
                        break;
                    case "Operator":
                        completions.push(this.createOperatorCompletion(value, element.alias, range, prefix));
                        break;
                    case "Type":
                        completions.push(this.createTypeCompletion(value, element.alias, range, prefix));
                        break;
                    case "TypeAlias":
                        completions.push(this.createTypeAliasCompletion(value, element.alias, range, prefix));
                        break;
                    // Do not handle operators, they are not valid if prefixed
                }
            });
        }
        completions.push(...elmUtils_1.getEmptyTypes().map(a => this.createCompletion(a.markdown, a.symbolKind, a.name, range, "d0000")));
        return completions;
    }
    getSameFileTopLevelCompletions(tree, range, moduleDefinition = false) {
        const completions = [];
        const topLevelFunctions = treeUtils_1.TreeUtils.findAllTopLeverFunctionDeclarations(tree);
        const prefix = "b";
        // Add functions
        if (topLevelFunctions) {
            const declarations = topLevelFunctions.filter(a => a.firstNamedChild !== null &&
                a.firstNamedChild.type === "function_declaration_left" &&
                a.firstNamedChild.firstNamedChild !== null &&
                a.firstNamedChild.firstNamedChild.type === "lower_case_identifier");
            for (const declaration of declarations) {
                const value = hintHelper_1.HintHelper.createHint(declaration);
                completions.push(this.createFunctionCompletion(value, declaration.firstNamedChild.firstNamedChild.text, range, prefix));
            }
        }
        // Add types
        const typeDeclarations = treeUtils_1.TreeUtils.findAllTypeDeclarations(tree);
        if (typeDeclarations) {
            for (const declaration of typeDeclarations) {
                const value = hintHelper_1.HintHelper.createHint(declaration);
                const name = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", declaration);
                if (name) {
                    completions.push(this.createTypeCompletion(value, name.text, range, prefix));
                    if (moduleDefinition) {
                        completions.push(this.createTypeCompletion(value, `${name.text}(..)`, range, prefix));
                    }
                }
                // Add types constructors
                const unionVariants = treeUtils_1.TreeUtils.descendantsOfType(declaration, "union_variant");
                for (const unionVariant of unionVariants) {
                    const unionVariantName = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", unionVariant);
                    if (unionVariantName) {
                        completions.push(this.createUnionConstructorCompletion(unionVariantName.text, range, prefix));
                    }
                }
            }
        }
        // Add alias types
        const typeAliasDeclarations = treeUtils_1.TreeUtils.findAllTypeAliasDeclarations(tree);
        if (typeAliasDeclarations) {
            for (const declaration of typeAliasDeclarations) {
                const value = hintHelper_1.HintHelper.createHint(declaration);
                const name = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", declaration);
                if (name) {
                    completions.push(this.createTypeAliasCompletion(value, name.text, range, prefix));
                }
            }
        }
        return completions;
    }
    createFunctionCompletion(markdownDocumentation, label, range, sortPrefix) {
        return this.createCompletion(markdownDocumentation, vscode_languageserver_1.CompletionItemKind.Function, label, range, sortPrefix);
    }
    createFunctionParameterCompletion(markdownDocumentation, label, range) {
        return this.createPreselectedCompletion(markdownDocumentation, vscode_languageserver_1.CompletionItemKind.Field, label, range);
    }
    createTypeCompletion(markdownDocumentation, label, range, sortPrefix) {
        return this.createCompletion(markdownDocumentation, vscode_languageserver_1.CompletionItemKind.Enum, label, range, sortPrefix);
    }
    createTypeAliasCompletion(markdownDocumentation, label, range, sortPrefix) {
        return this.createCompletion(markdownDocumentation, vscode_languageserver_1.CompletionItemKind.Struct, label, range, sortPrefix);
    }
    createOperatorCompletion(markdownDocumentation, label, range, sortPrefix) {
        return this.createCompletion(markdownDocumentation, vscode_languageserver_1.CompletionItemKind.Operator, label, range, sortPrefix);
    }
    createUnionConstructorCompletion(label, range, sortPrefix) {
        return this.createCompletion(undefined, vscode_languageserver_1.CompletionItemKind.EnumMember, label, range, sortPrefix);
    }
    createModuleCompletion(label, range, sortPrefix) {
        return this.createCompletion(undefined, vscode_languageserver_1.CompletionItemKind.Module, label, range, sortPrefix);
    }
    createCompletion(markdownDocumentation, kind, label, range, sortPrefix) {
        return {
            documentation: markdownDocumentation
                ? {
                    kind: vscode_languageserver_1.MarkupKind.Markdown,
                    value: markdownDocumentation !== null && markdownDocumentation !== void 0 ? markdownDocumentation : "",
                }
                : undefined,
            kind,
            label,
            sortText: `${sortPrefix}_${label}`,
            textEdit: vscode_languageserver_1.TextEdit.replace(range, label),
        };
    }
    createPreselectedCompletion(markdownDocumentation, kind, label, range) {
        return {
            documentation: markdownDocumentation
                ? {
                    kind: vscode_languageserver_1.MarkupKind.Markdown,
                    value: markdownDocumentation !== null && markdownDocumentation !== void 0 ? markdownDocumentation : "",
                }
                : undefined,
            kind,
            label,
            preselect: true,
            textEdit: vscode_languageserver_1.TextEdit.replace(range, label),
        };
    }
    findDefinitionsForScope(node, tree, range) {
        const result = [];
        const prefix = "a";
        if (node.parent) {
            if (node.parent.type === "let_in_expr") {
                const letNode = treeUtils_1.TreeUtils.findFirstNamedChildOfType("let", node.parent);
                if (letNode) {
                    letNode.children.forEach(nodeToProcess => {
                        if (nodeToProcess &&
                            nodeToProcess.type === "value_declaration" &&
                            nodeToProcess.firstNamedChild !== null &&
                            nodeToProcess.firstNamedChild.type ===
                                "function_declaration_left" &&
                            nodeToProcess.firstNamedChild.firstNamedChild !== null &&
                            nodeToProcess.firstNamedChild.firstNamedChild.type ===
                                "lower_case_identifier") {
                            const value = hintHelper_1.HintHelper.createHintFromDefinitionInLet(nodeToProcess);
                            result.push(this.createFunctionCompletion(value, nodeToProcess.firstNamedChild.firstNamedChild.text, range, prefix));
                        }
                    });
                }
            }
            if (node.parent.type === "case_of_branch" &&
                node.parent.firstNamedChild &&
                node.parent.firstNamedChild.type === "pattern" &&
                node.parent.firstNamedChild.firstNamedChild &&
                node.parent.firstNamedChild.firstNamedChild.type === "union_pattern" &&
                node.parent.firstNamedChild.firstNamedChild.childCount > 1 // Ignore cases of case branches with no params
            ) {
                const caseBranchVariableNodes = treeUtils_1.TreeUtils.findAllNamedChildrenOfType("lower_pattern", node.parent.firstNamedChild.firstNamedChild);
                if (caseBranchVariableNodes) {
                    caseBranchVariableNodes.forEach(a => {
                        const value = hintHelper_1.HintHelper.createHintFromDefinitionInCaseBranch();
                        result.push(this.createFunctionCompletion(value, a.text, range, prefix));
                    });
                }
            }
            if (node.parent.type === "value_declaration" &&
                node.parent.firstChild &&
                node.parent.firstChild.type === "function_declaration_left") {
                node.parent.firstChild.children.forEach(child => {
                    if (child.type === "lower_pattern") {
                        const markdownDocumentation = hintHelper_1.HintHelper.createHintFromFunctionParameter(child);
                        result.push(this.createFunctionParameterCompletion(markdownDocumentation, child.text, range));
                        const annotationTypeNode = treeUtils_1.TreeUtils.getTypeOrTypeAliasOfFunctionParameter(child);
                        if (annotationTypeNode) {
                            const typeDeclarationNode = treeUtils_1.TreeUtils.findTypeAliasDeclaration(tree, annotationTypeNode.text);
                            if (typeDeclarationNode) {
                                const fields = treeUtils_1.TreeUtils.getAllFieldsFromTypeAlias(typeDeclarationNode);
                                if (fields) {
                                    fields.forEach(element => {
                                        const hint = hintHelper_1.HintHelper.createHintForTypeAliasReference(element.type, element.field, child.text);
                                        result.push(this.createFunctionParameterCompletion(hint, `${child.text}.${element.field}`, range));
                                    });
                                }
                            }
                        }
                    }
                });
            }
            result.push(...this.findDefinitionsForScope(node.parent, tree, range));
        }
        return result;
    }
    createSnippet(label, snippetText, markdownDocumentation, kind) {
        return {
            documentation: markdownDocumentation
                ? {
                    kind: vscode_languageserver_1.MarkupKind.Markdown,
                    value: markdownDocumentation !== null && markdownDocumentation !== void 0 ? markdownDocumentation : "",
                }
                : undefined,
            insertText: Array.isArray(snippetText)
                ? snippetText.join("\n")
                : snippetText,
            insertTextFormat: vscode_languageserver_1.InsertTextFormat.Snippet,
            kind: kind !== null && kind !== void 0 ? kind : vscode_languageserver_1.CompletionItemKind.Snippet,
            label,
            sortText: `s_${label}`,
        };
    }
    // tslint:disable: no-duplicate-string
    // tslint:disable: no-big-function
    createSnippets() {
        return [
            this.createSnippet("module", "module ${1:Name} exposing (${2:..})", "Module definition"),
            this.createSnippet("import", "import ${1:Name} exposing (${2:..})", "Unqualified import"),
            this.createSnippet("of", ["of", "   $0"], "The of keyword", vscode_languageserver_1.CompletionItemKind.Keyword),
            this.createSnippet("case of", [
                "case ${1:expression} of",
                "    ${2:option1} ->",
                "        ${3}",
                "",
                "    ${4:option2} ->",
                "        ${5}",
                "$0",
            ], "Case of expression with 2 alternatives"),
            this.createSnippet("comment", ["{-", "${0}", "-}"], "Multi-line comment"),
            this.createSnippet("record", [
                "${1:recordName} =",
                "    { ${2:key1} = ${3:value1}",
                "    , ${4:key2} = ${5:value2}",
                "    }",
            ], "Record"),
            this.createSnippet("type alias", [
                "type alias ${1:recordName} =",
                "    { ${2:key1} : ${3:ValueType1}",
                "    , ${4:key2} : ${5:ValueType2}",
                "    }",
            ], "Type alias"),
            this.createSnippet("record update", ["{ ${1:recordName} | ${2:key} = ${3} }"], "Update record"),
            this.createSnippet("anonymous", ["\\ ${1:argument} -> ${1:argument}"], "Anonymous function"),
            this.createSnippet("type", ["type ${1:Typename}", "    = ${2:Value1}", "    | ${3:Value2}"], "Custom type"),
            this.createSnippet("msg", ["type Msg", "    = ${1:Message}", "    | ${2:Message}"], "Default message custom type"),
            this.createSnippet("func", [
                "${1:functionName} : ${2:ArgumentType} -> ${3:ReturnType}",
                "${1:functionName} ${4:arguments} =",
                "    ${5}",
            ], "Function with type annotation"),
            this.createSnippet("let in", ["let", "    ${1}", "in", "${0}"], "Let expression"),
            this.createSnippet("update", [
                "update : Msg -> Model -> ${1|Model, ( Model\\, Cmd Msg )|}",
                "update msg model =",
                "    case msg of",
                "        ${2:option1} ->",
                "            ${1|Model, ( Model\\, Cmd Msg )|}",
                "",
                "        ${3:option2} ->",
                "            ${1|Model, ( Model\\, Cmd Msg )|}",
            ], "Default update function"),
            this.createSnippet("view", ["view : Model -> Html Msg", "view model =", "    ${0}"], "Default view function"),
            this.createSnippet("port in", ["port ${1:portName} : (${2:Typename} -> msg) -> Sub msg"], "Incoming port"),
            this.createSnippet("port out", ["port ${1:portName} : ${2:Typename} -> Cmd msg"], "Outgoing port"),
            this.createSnippet("main sandbox", [
                "main : Program () Model Msg",
                "main =",
                "    Browser.sandbox",
                "        { init = init",
                "        , view = view",
                "        , update = update",
                "        }",
            ], "Main Browser Sandbox"),
            this.createSnippet("main element", [
                "main : Program () Model Msg",
                "main =",
                "    Browser.element",
                "        { init = init",
                "        , view = view",
                "        , update = update",
                "        , subscriptions = subscriptions",
                "        }",
            ], "Main Browser Element"),
            this.createSnippet("main document", [
                "main : Program () Model Msg",
                "main =",
                "    Browser.document",
                "        { init = init",
                "        , view = view",
                "        , update = update",
                "        , subscriptions = subscriptions",
                "        }",
            ], "Main Browser Document"),
            this.createSnippet("main application", [
                "main : Program () Model Msg",
                "main =",
                "    Browser.application",
                "        { init = init",
                "        , view = view",
                "        , update = update",
                "        , subscriptions = subscriptions",
                "        , onUrlChange = onUrlChange",
                "        , onUrlRequest = onUrlRequest",
                "        }",
            ], "Main Browser Application"),
            this.createSnippet("subscriptions", [
                "subscriptions : Model -> Sub Msg",
                "subscriptions model =",
                "    Sub.none",
            ], "Subscriptions"),
            this.createSnippet("default model", [
                "type alias Model =",
                "    { statusText : String",
                "    }",
                "",
                "",
                "model : Model",
                "model =",
                '    { statusText = "Ready"',
                "    }",
            ], "A default model with type declaration"),
            this.createSnippet("Browser.sandbox", [
                "module Main exposing (Model, Msg, update, view, subscriptions, init)",
                "",
                "import Html exposing (..)",
                "import Browser",
                "",
                "",
                "main : Program () Model Msg",
                "main =",
                "    Browser.sandbox",
                "        { init = init",
                "        , view = view",
                "        , update = update",
                "    }",
                "",
                "",
                "type alias Model =",
                "    { ${1:property} : ${2:propertyType}",
                "    }",
                "",
                "",
                "init : Model",
                "init =",
                "    Model ${3:modelInitialValue}",
                "",
                "",
                "type Msg",
                "    = ${4:Msg1}",
                "    | ${5:Msg2}",
                "",
                "",
                "update : Msg -> Model -> Model",
                "update msg model =",
                "    case msg of",
                "        ${6:Msg1} ->",
                "            model",
                "",
                "        ${7:Msg2} ->",
                "            model",
                "",
                "",
                "view : Model -> Html Msg",
                "view model =",
                "    div []",
                '        [ text "New Sandbox" ]',
                "",
                "",
                "${0}",
            ], "Browser Sandbox"),
            this.createSnippet("Browser.element", [
                "module Main exposing (Model, Msg, update, view, subscriptions, init)",
                "",
                "import Html exposing (..)",
                "import Browser",
                "",
                "",
                "main : Program flags Model Msg",
                "main =",
                "    Browser.element",
                "        { init = init",
                "        , view = view",
                "        , update = update",
                "        , subscriptions = subscriptions",
                "    }",
                "",
                "",
                "type alias Model =",
                "    { key : Nav.Key",
                "    , url : Url.Url",
                "    , property : propertyType",
                "    }",
                "",
                "",
                "init : flags -> (Model, Cmd Msg)",
                "init flags =",
                "    (Model modelInitialValue, Cmd.none)",
                "",
                "",
                "type Msg",
                "    = ${1:Msg1}",
                "    | ${2:Msg2}",
                "",
                "",
                "update : Msg -> Model -> (Model, Cmd Msg)",
                "update msg model =",
                "    case msg of",
                "        ${1:Msg1} ->",
                "            (model, Cmd.none)",
                "",
                "        ${2:Msg2} ->",
                "            (model, Cmd.none)",
                "",
                "",
                "subscriptions : Model -> Sub Msg",
                "subscriptions model =",
                "    Sub.none",
                "",
                "",
                "view : Model -> Html Msg",
                "view model =",
                "    div []",
                '        [ text "New Element" ]',
                "",
                "",
                "${0}",
            ], "Browser Element"),
            this.createSnippet("Browser.document", [
                "module Main exposing (Model, Msg, update, view, subscriptions, init)",
                "",
                "import Html exposing (..)",
                "import Browser",
                "",
                "",
                "main : Program flags Model Msg",
                "main =",
                "    Browser.document",
                "        { init = init",
                "        , view = view",
                "        , update = update",
                "        , subscriptions = subscriptions",
                "    }",
                "",
                "",
                "type alias Model =",
                "    { property : propertyType",
                "    }",
                "",
                "",
                "init : flags -> (Model, Cmd Msg)",
                "init flags =",
                "    (Model modelInitialValue, Cmd.none)",
                "",
                "",
                "type Msg",
                "    = ${1:Msg1}",
                "    | ${2:Msg2}",
                "",
                "",
                "update : Msg -> Model -> (Model, Cmd Msg)",
                "update msg model =",
                "    case msg of",
                "        ${1:Msg1} ->",
                "            (model, Cmd.none)",
                "",
                "        ${2:Msg2} ->",
                "            (model, Cmd.none)",
                "",
                "",
                "subscriptions : Model -> Sub Msg",
                "subscriptions model =",
                "    Sub.none",
                "",
                "",
                "view : Model -> Browser.Document Msg",
                "view model =",
                '    { title = "Document Title"',
                "    , body =",
                "        [ div []",
                '            [ text "New Document" ]',
                "      ]",
                "    }",
                "",
                "",
                "${0}",
            ], "Browser Document"),
            this.createSnippet("Browser.application", [
                "module Main exposing (Model, init, Msg, update, view, subscriptions)",
                "",
                "import Html exposing (..)",
                "import Browser",
                "import Browser.Navigation as Nav",
                "import Url",
                "",
                "",
                "main : Program flags Model Msg",
                "main =",
                "    Browser.application",
                "        { init = init",
                "        , view = view",
                "        , update = update",
                "        , subscriptions = subscriptions",
                "        , onUrlRequest = UrlRequested",
                "        , onUrlChange = UrlChanged",
                "    }",
                "",
                "",
                "type alias Model =",
                "    { key : Nav.Key",
                "    , url : Url.Url",
                "    , property : propertyType",
                "    }",
                "",
                "",
                "init : flags -> Url.Url -> Nav.Key -> (Model, Cmd Msg)",
                "init flags url key =",
                "    (Model modelInitialValue, Cmd.none)",
                "",
                "",
                "type Msg",
                "    = ${1:Msg1}",
                "    | ${2:Msg2}",
                "    | UrlRequested Browser.UrlRequest",
                "    | UrlChanged Url.Url",
                "",
                "",
                "update : Msg -> Model -> (Model, Cmd Msg)",
                "update msg model =",
                "    case msg of",
                "        ${1:Msg1} ->",
                "            (model, Cmd.none)",
                "",
                "        ${2:Msg2} ->",
                "            (model, Cmd.none)",
                "",
                "        UrlRequested urlRequest ->",
                "            case urlRequest of",
                "                Browser.Internal url ->",
                "                    ( model, Nav.pushUrl model.key (Url.toString url) )",
                "",
                "                Browser.External href ->",
                "                    ( model, Nav.load href )",
                "",
                "        UrlChanged url ->",
                "            ( { model | url = url }",
                "            , Cmd.none",
                "            )",
                "",
                "",
                "subscriptions : Model -> Sub Msg",
                "subscriptions model =",
                "    Sub.none",
                "",
                "",
                "view : Model -> Browser.Document Msg",
                "view model =",
                '    { title = "Application Title"',
                "    , body =",
                "        [ div []",
                '            [ text "New Application" ]',
                "      ]",
                "    }",
                "",
                "",
                "${0}",
            ], "Browser Application"),
            this.createSnippet("describe", ['describe "${1:name}"', "    [ ${0}", "    ]"], "Describe block in Elm-test"),
            this.createSnippet("test", ['test "${1:name}" <|', "    \\_ ->", "        ${0}"], "Test block in Elm-test"),
            this.createSnippet("todo", "-- TODO: ${0}", "TODO comment"),
        ];
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completionProvider.js.map