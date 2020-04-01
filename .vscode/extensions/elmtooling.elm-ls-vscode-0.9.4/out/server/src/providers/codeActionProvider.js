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
Object.defineProperty(exports, "__esModule", { value: true });
class CodeActionProvider {
    constructor(connection, elmAnalyse, elmMake) {
        this.connection = connection;
        this.elmAnalyse = elmAnalyse;
        this.elmMake = elmMake;
        this.onCodeAction = this.onCodeAction.bind(this);
        this.onExecuteCommand = this.onExecuteCommand.bind(this);
        this.connection.onCodeAction(this.onCodeAction);
        this.connection.onExecuteCommand(this.onExecuteCommand);
    }
    onCodeAction(params) {
        var _a;
        this.connection.console.info("A code action was requested");
        const analyse = (_a = (this.elmAnalyse && this.elmAnalyse.onCodeAction(params))) !== null && _a !== void 0 ? _a : [];
        const make = this.elmMake.onCodeAction(params);
        return [...analyse, ...make];
    }
    onExecuteCommand(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info("A command execution was requested");
            return this.elmAnalyse && this.elmAnalyse.onExecuteCommand(params);
        });
    }
}
exports.CodeActionProvider = CodeActionProvider;
//# sourceMappingURL=codeActionProvider.js.map