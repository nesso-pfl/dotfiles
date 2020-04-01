"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const treeUtils_1 = require("./treeUtils");
class RefactorEditUtils {
    static unexposedValueInModule(tree, valueName) {
        const exposedNodes = treeUtils_1.TreeUtils.getModuleExposingListNodes(tree);
        if (exposedNodes.length <= 1) {
            // We can't remove the last exposed one and removing the whole module annotation would just lead to elm-format readding it
            return undefined;
        }
        else {
            return this.removeValueFromExposingList(exposedNodes, valueName);
        }
    }
    static exposeValueInModule(tree, valueName) {
        const exposedNodes = treeUtils_1.TreeUtils.getModuleExposingListNodes(tree);
        if (exposedNodes.length > 0) {
            const lastExposedNode = exposedNodes[exposedNodes.length - 1];
            if (lastExposedNode) {
                return vscode_languageserver_1.TextEdit.insert(vscode_languageserver_1.Position.create(lastExposedNode.endPosition.row, lastExposedNode.endPosition.column), `, ${valueName}`);
            }
        }
    }
    static removeValueFromImport(tree, moduleName, valueName) {
        const importClause = treeUtils_1.TreeUtils.findImportClauseByName(tree, moduleName);
        if (importClause) {
            const exposedValues = treeUtils_1.TreeUtils.descendantsOfType(importClause, "exposed_value");
            if (exposedValues.length === 1 && exposedValues[0].text === valueName) {
                // Remove the entire import if it was the only one
                return vscode_languageserver_1.TextEdit.del(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(importClause.startPosition.row, importClause.startPosition.column), vscode_languageserver_1.Position.create(importClause.endPosition.row, importClause.endPosition.column)));
            }
            else {
                return this.removeValueFromExposingList(exposedValues, valueName);
            }
        }
    }
    static addImport(tree, moduleName, valueName) {
        var _a, _b;
        const lastImportNode = (_a = treeUtils_1.TreeUtils.getLastImportNode(tree)) !== null && _a !== void 0 ? _a : (_b = treeUtils_1.TreeUtils.getModuleNameNode(tree)) === null || _b === void 0 ? void 0 : _b.parent;
        return vscode_languageserver_1.TextEdit.insert(vscode_languageserver_1.Position.create((lastImportNode === null || lastImportNode === void 0 ? void 0 : lastImportNode.endPosition.row) ? (lastImportNode === null || lastImportNode === void 0 ? void 0 : lastImportNode.endPosition.row) + 1
            : 1, 0), valueName
            ? `import ${moduleName} exposing (${valueName})\n`
            : `import ${moduleName}\n`);
    }
    static changeQualifiedReferenceModule(node, newModuleName) {
        if (node.parent && node.parent.type === "value_qid") {
            const moduleNode = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", node.parent);
            if (moduleNode) {
                return vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(moduleNode.startPosition.row, moduleNode.startPosition.column), vscode_languageserver_1.Position.create(moduleNode.endPosition.row, moduleNode.endPosition.column)), newModuleName);
            }
        }
    }
    static removeQualifiedReference(node) {
        if (node.parent && node.parent.type === "value_qid") {
            const moduleNode = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", node.parent);
            if (moduleNode) {
                return vscode_languageserver_1.TextEdit.del(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(moduleNode.startPosition.row, moduleNode.startPosition.column), vscode_languageserver_1.Position.create(moduleNode.endPosition.row, moduleNode.endPosition.column + 1)));
            }
        }
    }
    static addImports(tree, importData) {
        var _a, _b;
        const lastImportNode = (_a = treeUtils_1.TreeUtils.getLastImportNode(tree)) !== null && _a !== void 0 ? _a : (_b = treeUtils_1.TreeUtils.getModuleNameNode(tree)) === null || _b === void 0 ? void 0 : _b.parent;
        const imports = importData
            .filter((data, i, array) => array.findIndex((d) => d.moduleName === data.moduleName &&
            d.valueName === data.valueName) === i)
            .map((data) => data.valueName
            ? `import ${data.moduleName} exposing (${data.valueName})`
            : `import ${data.moduleName}`)
            .join("\n")
            .concat("\n");
        return vscode_languageserver_1.TextEdit.insert(vscode_languageserver_1.Position.create((lastImportNode === null || lastImportNode === void 0 ? void 0 : lastImportNode.endPosition.row) ? (lastImportNode === null || lastImportNode === void 0 ? void 0 : lastImportNode.endPosition.row) + 1
            : 1, 0), imports);
    }
    static removeValueFromExposingList(exposedNodes, valueName) {
        var _a, _b, _c;
        const exposedNode = exposedNodes.find((node) => node.text === valueName || node.text === `${valueName}(..)`);
        if (exposedNode) {
            let startPosition = exposedNode.startPosition;
            let endPosition = exposedNode.endPosition;
            if (((_a = exposedNode.previousNamedSibling) === null || _a === void 0 ? void 0 : _a.text) === ",") {
                startPosition = exposedNode.previousNamedSibling.startPosition;
            }
            if (((_b = exposedNode.previousNamedSibling) === null || _b === void 0 ? void 0 : _b.text) !== "," &&
                ((_c = exposedNode.nextNamedSibling) === null || _c === void 0 ? void 0 : _c.text) === ",") {
                endPosition = exposedNode.nextNamedSibling.endPosition;
            }
            return vscode_languageserver_1.TextEdit.del(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(startPosition.row, startPosition.column), vscode_languageserver_1.Position.create(endPosition.row, endPosition.column)));
        }
    }
}
exports.RefactorEditUtils = RefactorEditUtils;
//# sourceMappingURL=refactorEditUtils.js.map