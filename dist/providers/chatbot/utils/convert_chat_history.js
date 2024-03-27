"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConvertChatHistory = void 0;
const schema_1 = require("langchain/schema");
function getConvertChatHistory(messages) {
    const fullChatHistory = messages.map((message) => {
        if (message instanceof schema_1.HumanMessage) {
            return `Human: ${message.content}`;
        }
        else {
            return `AI: ${message.content}`;
        }
    }).join('\n');
    return fullChatHistory;
}
exports.getConvertChatHistory = getConvertChatHistory;
//# sourceMappingURL=convert_chat_history.js.map