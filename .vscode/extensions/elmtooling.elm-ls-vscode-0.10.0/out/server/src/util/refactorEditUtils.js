"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const treeUtils_1 = require("./treeUtils");
class RefactorEditUtils {
    static unexposedValueInModule(tree, valueName) {
        const exposedNodes = treeUtils_1.TreeUtils.getModuleExposingListNodes(tree);
        return this.removeValueFromExposingList(exposedNodes, valueName);
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
        const lastImportNode = treeUtils_1.TreeUtils.getLastImportNode(tree);
        if (lastImportNode) {
            return vscode_languageserver_1.TextEdit.insert(vscode_languageserver_1.Position.create(lastImportNode.endPosition.row + 1, 0), valueName
                ? `import ${moduleName} exposing (${valueName})`
                : `import ${moduleName}`);
        }
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
    static removeValueFromExposingList(exposedNodes, valueName) {
        var _a, _b, _c;
        const exposedNode = exposedNodes.find((node) => node.text === valueName);
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