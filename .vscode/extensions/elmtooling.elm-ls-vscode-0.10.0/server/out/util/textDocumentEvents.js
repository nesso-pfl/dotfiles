"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
// This is loosely based on https://github.com/Microsoft/vscode-languageserver-node/blob/73180893ca/server/src/main.ts#L124
// With some simplifications and the ability to support multiple listeners
class TextDocumentEvents extends events_1.EventEmitter {
    constructor(configuration, events) {
        super();
        this._documents = Object.create(null);
        this._configuration = configuration;
        events.on("open", (params) => {
            const td = params.textDocument;
            const document = this._configuration.create(td.uri, td.languageId, td.version, td.text);
            this._documents[params.textDocument.uri] = document;
            this.emit("open", Object.freeze({ document }));
        });
        events.on("change", (params) => {
            const td = params.textDocument;
            const changes = params.contentChanges;
            if (changes.length === 0) {
                return;
            }
            let document = this._documents[td.uri];
            const { version } = td;
            if (version === null || version === void 0) {
                throw new Error(`Received document change event for ${td.uri} without valid version identifier`);
            }
            document = this._configuration.update(document, changes, version);
            this._documents[td.uri] = document;
            this.emit("change", Object.freeze({ document }));
        });
        events.on("save", (params) => {
            const document = this._documents[params.textDocument.uri];
            if (document) {
                this.emit("save", Object.freeze({ document }));
            }
        });
        events.on("close", (params) => {
            const document = this._documents[params.textDocument.uri];
            if (document) {
                delete this._documents[params.textDocument.uri];
                this.emit("close", Object.freeze({ document }));
            }
        });
    }
    /**
     * Returns the document for the given URI. Returns undefined if
     * the document is not managed by this instance.
     *
     * @param uri The text document's URI to retrieve.
     * @return the text document or `undefined`.
     */
    get(uri) {
        return this._documents[uri];
    }
}
exports.TextDocumentEvents = TextDocumentEvents;
//# sourceMappingURL=textDocumentEvents.js.map