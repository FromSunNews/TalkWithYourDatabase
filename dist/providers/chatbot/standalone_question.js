"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStandaloneQuestion = void 0;
const upstash_chat_history_1 = require("./utils/upstash_chat_history");
const openai_1 = __importDefault(require("openai"));
const environment_1 = require("../../config/environment");
// export const getStandaloneQuestion = async (sessionId: string, question: string) => {
//   const standaloneQuestionTemplate = `
//   You are a rephraser and always respond with a rephrased VIETNAMESE version of the input that is given to a search engine API. Always be succint and use the same words as the input. RETURN ONLY A REVISED VIETNAMESE VERSION OF THE INPUT AND ADD NO MORE SENTENCES.
//   Given some conversation history (if any) and a question, convert the question to a standalone question. 
//   Conversation history: {chat_history}
//   Question: {question} 
//   Standalone question in Vietnamese:`
//   const chain = RunnableSequence.from([
//     PromptTemplate.fromTemplate(standaloneQuestionTemplate),
//     getModelOpenAI(),
//     new StringOutputParser(),
//   ]);
//   const chat_history = await getChatHistoryConvertString(sessionId);
//   const respone = await chain.invoke({
//     chat_history,
//     question
//   });
//   return respone;
// }
const getStandaloneQuestion = async (sessionId, question) => {
    const openai = new openai_1.default({ apiKey: environment_1.env.OPENAI_API_KEY });
    let chat_history = await (0, upstash_chat_history_1.getChatHistoryConvertString)(sessionId);
    chat_history += "\nHuman: " + question;
    const response = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `
        - You are a rephraser and always respond with a rephrased VIETNAMESE version of the input and the chat history that is given to a search engine API. 
        - Always keep full of meaning for search engine API.
        - Conversation history: ${chat_history}
        - Based on the previous conversation history and the current question, synthesize it into a meaningful complete question. Please create an meaningful string question using JSON in Vietnamese.
         The JSON schema should include {
          "question": "Meaningful Question in Vietnamese"
         }
        `,
            },
            {
                role: "user",
                content: `Question: ${question}`,
            },
            {
                role: "assistant",
                content: "(JSON schemma answer)",
            },
        ],
        model: "gpt-3.5-turbo-1106",
        temperature: 0
    });
    const result = JSON.parse(response.choices[0].message.content ?? "");
    return result?.question;
};
exports.getStandaloneQuestion = getStandaloneQuestion;
//# sourceMappingURL=standalone_question.js.map