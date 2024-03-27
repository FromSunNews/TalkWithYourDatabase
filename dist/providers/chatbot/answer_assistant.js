"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswerNormalAssistant = void 0;
const prompts_1 = require("langchain/prompts");
const get_llm_1 = require("./utils/get_llm");
const output_parser_1 = require("langchain/schema/output_parser");
const runnables_1 = require("@langchain/core/runnables");
const prompt_1 = require("./utils/prompt");
const upstash_chat_history_1 = require("./utils/upstash_chat_history");
// const promptTemplate = ChatPromptTemplate.fromTemplate(`${promptRole}          
//       Please just use the conversation history to see if you can reply from there. If possible, please answer in Tiếng Việt (IMPORTANT).
//       Avoid fabricating an answer. Always speak as if you're chatting with a friend. Remember to mention the user's name when chatting. The user's name is {user_name}. 
//       If you are really unsure about the correctness of your answer, return "SEARCH INTERNET" for search engine use.
//       Note that if the user asks a question about the KNOWLEDGE, "SEARCH_INTERNET" is returned immediately.
//       Note that if the user asks a question about the SEEKING JOB, "SEARCH_DATABASE" is returned immediately.
//       <chat_history>
//       {chat_history}
//       </chat_history>
//       <question>
//       {question}
//       </question>
//       Answer:`);
const getAnswerNormalAssistant = async (sessionId, question, user_name) => {
    const promptTemplate = prompts_1.ChatPromptTemplate.fromMessages([
        ["system", `${prompt_1.promptRole}
      - Here is query: {question}, respond back with an answer for user is as long as possible. You can based on history chat that human provided below
      - Don't try to make up an answer. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." then direct the questioner to email softseekservice@gmail.com to assist. 
      - Always speak as if you were chatting to a friend. 
      - Please mention the user's name when chatting. The user's name is {user_name}
      - Please answer in VIETNAMESE
    `],
        ["system", "History chat: {chat_history}"],
        ["system", "Answer: "]
    ]);
    const chain = runnables_1.RunnableSequence.from([
        promptTemplate,
        (0, get_llm_1.getModelOpenAI)(),
        new output_parser_1.StringOutputParser(),
    ]);
    let chat_history = await (0, upstash_chat_history_1.getChatHistoryConvertString)(sessionId);
    chat_history += "Human: " + question;
    const respone = await chain.invoke({
        user_name,
        chat_history,
        question
    });
    return respone;
};
exports.getAnswerNormalAssistant = getAnswerNormalAssistant;
//# sourceMappingURL=answer_assistant.js.map