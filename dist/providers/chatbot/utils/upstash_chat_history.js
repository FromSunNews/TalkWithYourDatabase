"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChatHistory = exports.getChatHistoryConvertString = exports.getChatHistoryBasic = void 0;
const environment_1 = require("../../../config/environment");
const upstash_redis_1 = require("langchain/stores/message/upstash_redis");
const convert_chat_history_1 = require("./convert_chat_history");
const schema_1 = require("langchain/schema");
const getChatHistoryBasic = async (sessionId) => {
    try {
        const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
            sessionId,
            config: {
                url: environment_1.env.UPSTASH_REDIS_REST_URL || "",
                token: environment_1.env.UPSTASH_REDIS_REST_TOKEN || ""
            }
        });
        const basicChatHistory = await upstashChatHistory.getMessages();
        return basicChatHistory;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.getChatHistoryBasic = getChatHistoryBasic;
const getChatHistoryConvertString = async (sessionId) => {
    try {
        const basicChatHistory = await (0, exports.getChatHistoryBasic)(sessionId);
        return (0, convert_chat_history_1.getConvertChatHistory)(basicChatHistory.splice(-5));
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.getChatHistoryConvertString = getChatHistoryConvertString;
const addChatHistory = async (sessionId, input, response) => {
    try {
        const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
            sessionId,
            config: {
                url: environment_1.env.UPSTASH_REDIS_REST_URL || "",
                token: environment_1.env.UPSTASH_REDIS_REST_TOKEN || ""
            }
        });
        const result = await upstashChatHistory.addMessages([new schema_1.HumanMessage(input), new schema_1.AIMessage(response)]);
        // console.log("🚀 ~ addChatHistory ~ result:", result)
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.addChatHistory = addChatHistory;
//# sourceMappingURL=upstash_chat_history.js.map