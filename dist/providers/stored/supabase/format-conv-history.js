"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConvHistory = void 0;
const schema_1 = require("langchain/schema");
// export function formatConvHistory(messages: string[]) {
//   return messages.map((message: string, i: number) => {
//     if (i % 2 === 0) {
//       return `Human: ${message}`
//     } else {
//       return `AI: ${message}`
//     }
//   }).join('\n')
// }
function formatConvHistory(messages) {
    return messages.map((message) => {
        if (message instanceof schema_1.HumanMessage) {
            return `Human: ${message.content}`;
        }
        else {
            return `AI: ${message.content}`;
        }
    }).join('\n');
}
exports.formatConvHistory = formatConvHistory;
//# sourceMappingURL=format-conv-history.js.map