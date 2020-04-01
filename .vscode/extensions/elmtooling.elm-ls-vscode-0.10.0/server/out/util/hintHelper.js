"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const treeUtils_1 = require("./treeUtils");
class HintHelper {
    static createHint(node) {
        if (node) {
            if (node.type === "module_declaration") {
                return this.createHintFromModule(node);
            }
            else if (node.parent && node.parent.type === "let_in_expr") {
                return this.createHintFromDefinitionInLet(node);
            }
            else {
                return this.createHintFromDefinition(node);
            }
        }
    }
    static createHintFromFunctionParameter(node) {
        const annotation = treeUtils_1.TreeUtils.getTypeOrTypeAliasOfFunctionParameter(node);
        if (annotation) {
            return this.formatHint(annotation.text, "Local parameter");
        }
        return "Local parameter";
    }
    static createHintForTypeAliasReference(annotation, fieldName, parentName) {
        return this.formatHint(annotation, parentName
            ? `Refers to the \`${fieldName}\` field on \`${parentName}\``
            : `Refers to the \`${fieldName}\` field`);
    }
    static createHintFromDefinitionInLet(declaration) {
        if (declaration) {
            const comment = "Defined in local let scope";
            let annotation = "";
            if (declaration.previousNamedSibling) {
                if (declaration.previousNamedSibling.type === "type_annotation") {
                    annotation = declaration.previousNamedSibling.text;
                }
                return this.formatHint(annotation, comment);
            }
        }
    }
    static createHintFromDefinitionInCaseBranch() {
        const comment = "Defined in local case branch";
        return this.formatHint("", comment);
    }
    static createHintFromDefinition(declaration) {
        var _a, _b, _c;
        if (declaration) {
            let code;
            let comment = "";
            let annotation = "";
            if (declaration.type === "type_declaration" ||
                declaration.type === "type_alias_declaration") {
                code = declaration.text;
            }
            if (declaration.type === "union_variant") {
                if (((_b = (_a = declaration.parent) === null || _a === void 0 ? void 0 : _a.previousNamedSibling) === null || _b === void 0 ? void 0 : _b.type) !== "block_comment") {
                    code = declaration.text;
                    if (declaration.parent) {
                        const typeName = (_c = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", declaration.parent)) === null || _c === void 0 ? void 0 : _c.text;
                        comment = `A variant on the union type \`${typeName}\`` || "";
                    }
                }
                else {
                    declaration = declaration.parent ? declaration.parent : declaration;
                }
            }
            if (declaration.previousNamedSibling) {
                if (declaration.previousNamedSibling.type === "type_annotation") {
                    annotation = declaration.previousNamedSibling.text;
                    if (declaration.previousNamedSibling.previousNamedSibling &&
                        declaration.previousNamedSibling.previousNamedSibling.type ===
                            "block_comment") {
                        comment =
                            declaration.previousNamedSibling.previousNamedSibling.text;
                    }
                }
                else if (declaration.previousNamedSibling.type === "block_comment") {
                    comment = declaration.previousNamedSibling.text;
                }
            }
            return this.formatHint(annotation, comment, code);
        }
    }
    static createHintFromModule(moduleNode) {
        if (moduleNode) {
            let comment = "";
            if (moduleNode.nextNamedSibling &&
                moduleNode.nextNamedSibling.type === "block_comment") {
                comment = moduleNode.nextNamedSibling.text;
            }
            return this.formatHint("", comment);
        }
    }
    static formatHint(annotation, comment, code) {
        let value = "";
        if (annotation) {
            value += this.wrapCodeInMarkdown(annotation);
            if (value.length > 0 && (code || comment)) {
                value += "\n\n---\n\n";
            }
        }
        if (code) {
            value += this.wrapCodeInMarkdown(code);
        }
        if (comment) {
            value += this.stripComment(comment);
        }
        return value;
    }
    static stripComment(comment) {
        let newComment = comment;
        if (newComment.startsWith("{-|")) {
            newComment = newComment.slice(3);
        }
        if (newComment.startsWith("{-")) {
            newComment = newComment.slice(2);
        }
        if (newComment.endsWith("-}")) {
            newComment = newComment.slice(0, -2);
        }
        return newComment.trim();
    }
    static wrapCodeInMarkdown(code) {
        return `\n\`\`\`elm\n${code}\n\`\`\`\n`;
    }
}
exports.HintHelper = HintHelper;
//# sourceMappingURL=hintHelper.js.map