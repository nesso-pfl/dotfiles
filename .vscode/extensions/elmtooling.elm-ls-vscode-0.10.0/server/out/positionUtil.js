"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
class PositionUtil {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
    static FROM_VS_POSITION(position) {
        return new PositionUtil(position.line, position.character);
    }
    static FROM_TS_POSITION(position) {
        return new PositionUtil(position.row, position.column);
    }
    toVSPosition() {
        return vscode_languageserver_1.Position.create(this.row, this.col);
    }
    toTSPosition() {
        return {
            column: this.col,
            row: this.row,
        };
    }
}
exports.PositionUtil = PositionUtil;
//# sourceMappingURL=positionUtil.js.map