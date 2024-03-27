"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMemory = void 0;
const openai_1 = require("@langchain/openai");
const chains_1 = require("langchain/chains");
const memory_1 = require("langchain/memory");
const prompts_1 = require("langchain/prompts");
const upstash_redis_1 = require("langchain/stores/message/upstash_redis");
const environment_1 = require("../../config/environment");
const handleMemory = async () => {
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-3.5-turbo-1106",
        temperature: 0.2,
    });
    const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
    You are an AI assistant.
    History: {history}
    {input}
  `);
    const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
        sessionId: "chat1",
        config: {
            url: environment_1.env.UPSTASH_REDIS_REST_URL || "",
            token: environment_1.env.UPSTASH_REDIS_REST_TOKEN || ""
        }
    });
    const memory = new memory_1.BufferMemory({
        memoryKey: "history",
        chatHistory: upstashChatHistory
    });
    // using the chain classes
    const chain = new chains_1.ConversationChain({
        llm: model,
        prompt,
        memory
    });
    const input = {
        input: "repeat my name!"
    };
    const response = await chain.invoke(input);
    console.log("🚀 ~ handleMemory ~ response:", response);
};
exports.handleMemory = handleMemory;
//# sourceMappingURL=memory.js.map