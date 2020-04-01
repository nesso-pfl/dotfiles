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
class Settings {
    constructor(connection, config, clientCapabilities) {
        this.connection = connection;
        this.clientCapabilities = clientCapabilities;
        this.clientSettings = {
            elmAnalyseTrigger: "change",
            elmFormatPath: "",
            elmPath: "",
            elmTestPath: "",
            trace: { server: "off" },
        };
        this.initDone = false;
        this.updateSettings(config);
    }
    initFinished() {
        this.initDone = true;
    }
    getClientSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initDone &&
                this.clientCapabilities.workspace &&
                this.clientCapabilities.workspace.configuration) {
                this.updateSettings(yield this.connection.workspace.getConfiguration("elmLS"));
            }
            return this.clientSettings;
        });
    }
    get extendedCapabilities() {
        return this.clientSettings.extendedCapabilities;
    }
    updateSettings(config) {
        this.clientSettings = Object.assign(Object.assign({}, this.clientSettings), config);
    }
}
exports.Settings = Settings;
//# sourceMappingURL=settings.js.map