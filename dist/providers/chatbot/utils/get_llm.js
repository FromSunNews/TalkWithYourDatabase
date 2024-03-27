"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelLlm = exports.getModelLlama = exports.getModelOpenAI = void 0;
const openai_1 = require("@langchain/openai");
const groq_1 = require("@langchain/groq");
const getModelOpenAI = () => {
    return new openai_1.ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
};
exports.getModelOpenAI = getModelOpenAI;
const getModelLlama = () => {
    const openai = new groq_1.ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
    });
    return openai;
};
exports.getModelLlama = getModelLlama;
const getModelLlm = () => {
    const openai = new groq_1.ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
    });
    return openai;
};
exports.getModelLlm = getModelLlm;
//# sourceMappingURL=get_llm.js.map