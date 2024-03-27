"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuestion = exports.getContextualQuestion = void 0;
const openai_1 = require("@langchain/openai");
const environment_1 = require("../../../config/environment");
const prompts_1 = require("langchain/prompts");
const output_parser_1 = require("langchain/schema/output_parser");
const upstash_redis_1 = require("langchain/stores/message/upstash_redis");
const getContextualQuestion = async (chat_history, question) => {
    const llm = new openai_1.ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
    const historyAwarePrompt = prompts_1.ChatPromptTemplate.fromMessages([
        new prompts_1.MessagesPlaceholder("chat_history"),
        ["user", "Question {question}"],
        [
            "user",
            "Given the above conversation and question, generate a context include necessary infomation to look up in order to get information relevant to the conversation",
        ],
    ]);
    const chain = historyAwarePrompt.pipe(llm).pipe(new output_parser_1.StringOutputParser());
    await chain.invoke({
        chat_history,
        question
    });
};
exports.getContextualQuestion = getContextualQuestion;
const handleQuestion = async () => {
    const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
        sessionId: "chat1",
        config: {
            url: environment_1.env.UPSTASH_REDIS_REST_URL || "",
            token: environment_1.env.UPSTASH_REDIS_REST_TOKEN || ""
        }
    });
    const chat_history = await upstashChatHistory.getMessages();
    const question = "Tôi vừa hỏi gì ?";
    const response = await (0, exports.getContextualQuestion)(chat_history, question);
    console.log("🚀 ~ handleQuestion ~ response:", response);
};
exports.handleQuestion = handleQuestion;
//# sourceMappingURL=contextual_question.js.map