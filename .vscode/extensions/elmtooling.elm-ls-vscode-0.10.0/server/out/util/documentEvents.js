"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class DocumentEvents extends events_1.EventEmitter {
    constructor(connection) {
        super();
        connection.onDidChangeTextDocument((e) => this.emit("change", e));
        connection.onDidCloseTextDocument((e) => this.emit("close", e));
        connection.onDidOpenTextDocument((e) => this.emit("open", e));
        connection.onDidSaveTextDocument((e) => this.emit("save", e));
    }
}
exports.DocumentEvents = DocumentEvents;
//# sourceMappingURL=documentEvents.js.map