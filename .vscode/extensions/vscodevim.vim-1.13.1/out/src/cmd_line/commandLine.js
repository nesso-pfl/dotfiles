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
const parser = require("./parser");
const vscode = require("vscode");
const historyFile_1 = require("../history/historyFile");
const mode_1 = require("./../mode/mode");
const logger_1 = require("../util/logger");
const statusBar_1 = require("../statusBar");
const error_1 = require("../error");
const configuration_1 = require("../configuration/configuration");
const register_1 = require("../register/register");
const recordedState_1 = require("../state/recordedState");
class CommandLine {
    constructor() {
        this._logger = logger_1.Logger.get('CommandLine');
        /**
         *  Index used for navigating commandline history with <up> and <down>
         */
        this._commandLineHistoryIndex = 0;
        /**
         * for checking the last pressed key in command mode
         */
        this.lastKeyPressed = '';
        this.autoCompleteIndex = 0;
        this.autoCompleteItems = [];
        this.preCompleteCharacterPos = 0;
        this.preCompleteCommand = '';
        this.previousMode = mode_1.Mode.Normal;
        this._history = new historyFile_1.CommandLineHistory();
    }
    get commandlineHistoryIndex() {
        return this._commandLineHistoryIndex;
    }
    set commandlineHistoryIndex(index) {
        this._commandLineHistoryIndex = index;
    }
    get historyEntries() {
        return this._history.get();
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._history.load();
        });
    }
    Run(command, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!command || command.length === 0) {
                return;
            }
            if (command && command[0] === ':') {
                command = command.slice(1);
            }
            if ('help'.startsWith(command.split(/\s/)[0])) {
                statusBar_1.StatusBar.setText(vimState, `:help Not supported.`, true);
                return;
            }
            this._history.add(command);
            this._commandLineHistoryIndex = this._history.get().length;
            if (!command.startsWith('reg')) {
                let recState = new recordedState_1.RecordedState();
                recState.registerName = ':';
                recState.commandList = command.split('');
                register_1.Register.putByKey(recState, ':', undefined, true);
            }
            try {
                const cmd = parser.parse(command);
                const useNeovim = configuration_1.configuration.enableNeovim && cmd.command && cmd.command.neovimCapable();
                if (useNeovim) {
                    const statusBarText = yield vimState.nvim.run(vimState, command);
                    statusBar_1.StatusBar.setText(vimState, statusBarText);
                }
                else {
                    yield cmd.execute(vimState.editor, vimState);
                }
            }
            catch (e) {
                if (e instanceof error_1.VimError) {
                    if (e.code === error_1.ErrorCode.NotAnEditorCommand && configuration_1.configuration.enableNeovim) {
                        const statusBarText = yield vimState.nvim.run(vimState, command);
                        statusBar_1.StatusBar.setText(vimState, statusBarText, true);
                    }
                    else {
                        statusBar_1.StatusBar.setText(vimState, e.toString(), true);
                    }
                }
                else {
                    this._logger.error(`Error executing cmd=${command}. err=${e}.`);
                }
            }
        });
    }
    /**
     * Prompts the user for a command using an InputBox, and runs the provided command
     */
    PromptAndRun(initialText, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vscode.window.activeTextEditor) {
                this._logger.debug('No active document');
                return;
            }
            let cmd = yield vscode.window.showInputBox(this.getInputBoxOptions(initialText));
            yield this.Run(cmd, vimState);
        });
    }
    getInputBoxOptions(text) {
        return {
            prompt: 'Vim command line',
            value: text,
            ignoreFocusOut: false,
            valueSelection: [text.length, text.length],
        };
    }
    showHistory(initialText) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vscode.window.activeTextEditor) {
                this._logger.debug('No active document.');
                return '';
            }
            this._history.add(initialText);
            let cmd = yield vscode.window.showQuickPick(this._history
                .get()
                .slice()
                .reverse(), {
                placeHolder: 'Vim command history',
                ignoreFocusOut: false,
            });
            return cmd;
        });
    }
}
exports.commandLine = new CommandLine();

//# sourceMappingURL=commandLine.js.map
