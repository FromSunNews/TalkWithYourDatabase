"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoryAwareRetrieverChain = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("langchain/prompts");
const output_parser_1 = require("langchain/schema/output_parser");
const getHistoryAwareRetrieverChain = async () => {
    const llm = new openai_1.ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
    const historyAwarePrompt = prompts_1.ChatPromptTemplate.fromMessages([
        new prompts_1.MessagesPlaceholder("chat_history"),
        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
        ],
    ]);
    const historyAwareRetrieverChain = historyAwarePrompt.pipe(llm).pipe(new output_parser_1.StringOutputParser());
    const re = await historyAwareRetrieverChain.invoke({});
};
exports.getHistoryAwareRetrieverChain = getHistoryAwareRetrieverChain;
//# sourceMappingURL=retrieval.js.map