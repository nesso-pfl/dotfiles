"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ranking_1 = __importDefault(require("../providers/ranking"));
const treeUtils_1 = require("./treeUtils");
class ImportUtils {
    static getPossibleImports(forest) {
        const exposedValues = [];
        // Find all exposed values that could be imported
        if (forest) {
            forest.treeIndex.forEach((tree) => {
                var _a;
                (_a = tree.exposing) === null || _a === void 0 ? void 0 : _a.forEach((exposed) => {
                    var _a;
                    const module = tree.moduleName;
                    if (module) {
                        exposedValues.push({
                            module,
                            value: exposed.name,
                            package: tree.maintainerAndPackageName,
                        });
                        (_a = exposed.exposedUnionConstructors) === null || _a === void 0 ? void 0 : _a.forEach((exp) => {
                            var _a;
                            if (exp.syntaxNode.parent) {
                                const value = (_a = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", exp.syntaxNode.parent)) === null || _a === void 0 ? void 0 : _a.text;
                                if (value) {
                                    exposedValues.push({
                                        module,
                                        value: exp.name,
                                        valueToImport: `${value}(..)`,
                                        package: tree.maintainerAndPackageName,
                                    });
                                }
                            }
                        });
                    }
                });
            });
        }
        const ranking = ranking_1.default;
        exposedValues.sort((a, b) => {
            if (!a.package && b.package) {
                return -1;
            }
            else if (a.package && !b.package) {
                return 1;
            }
            else if (a.package && b.package) {
                return ranking[a.package].localeCompare(ranking[b.package]);
            }
            else {
                return 0;
            }
        });
        return exposedValues;
    }
}
exports.ImportUtils = ImportUtils;
//# sourceMappingURL=importUtils.js.map