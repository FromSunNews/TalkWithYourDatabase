"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassificationResult = void 0;
const prompts_1 = require("langchain/prompts");
const get_llm_1 = require("./utils/get_llm");
const output_parser_1 = require("langchain/schema/output_parser");
const runnables_1 = require("@langchain/core/runnables");
const upstash_chat_history_1 = require("./utils/upstash_chat_history");
const getClassificationResult = async (sessionId, question) => {
    const promptTemplate = prompts_1.PromptTemplate.fromTemplate(`

  Regarding the user question below, please classify it as about \`ANSWER_NORMAL\`,\`SEARCH_INTERNET\`,\`SEARCH_JOB\`.
  Based on question and chat history:
  if question is related to CHAT HISTORY return "ANSWER_NORMAL",
  if else question is related to FINDING JOBS FOR USER return "SEARCH_JOB" (When Only user queries about current opening jobs that the system has at the moment . Example: Are there any React web developer intern jobs?. Move on to the next condition if this condition is not met!), 
  if else question is related to KNOWLEDGE return "SEARCH_INTERNET"
  Do not respond with more than one word.

  <chat_history>
  {chat_history}
  </chat_history>
  
  <question>
  {question}
  </question>

  Classification:`);
    const classificationChain = runnables_1.RunnableSequence.from([
        promptTemplate,
        (0, get_llm_1.getModelOpenAI)(),
        new output_parser_1.StringOutputParser(),
    ]);
    const chat_history = await (0, upstash_chat_history_1.getChatHistoryConvertString)(sessionId);
    const respone = await classificationChain.invoke({
        chat_history,
        question
    });
    return respone;
};
exports.getClassificationResult = getClassificationResult;
//# sourceMappingURL=classification.js.map