"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llm = void 0;
const openai_1 = require("@langchain/openai");
const llm = async () => {
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-3.5-turbo-0125",
        temperature: 0.7,
        maxTokens: 1000,
        verbose: true
    });
    const response = await model.invoke("Write a letter for sick!");
    console.log("🚀 ~ llm ~ response:", response);
};
exports.llm = llm;
//# sourceMappingURL=llm.js.map