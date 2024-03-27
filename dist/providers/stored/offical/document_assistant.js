"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswerDocumentAssistant = void 0;
const prompts_1 = require("@langchain/core/prompts");
const output_parser_1 = require("langchain/schema/output_parser");
const runnables_1 = require("@langchain/core/runnables");
const retriever_1 = require("../../chatbot/utils/retriever");
const combine_documents_1 = require("../../chatbot/utils/combine_documents");
const upstash_chat_history_1 = require("../../chatbot/utils/upstash_chat_history");
const get_llm_1 = require("../../chatbot/utils/get_llm");
const prompt_1 = require("../../chatbot/utils/prompt");
const getAnswerDocumentAssistant = async (sessionId, question, user_name) => {
    const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
  Conversation history: {conv_history}
  Question: {question} 
  Standalone question:`;
    const answerTemplate = `
  ${prompt_1.promptRole} 
  Based on the context provided and the conversation history. Try to find the answer in the context. Answer the question in Vietnamese by your own words based on the information found. 
  If the answer is not given in the context, find the answer in the conversation history if possible.
  Please answer in VIETNAMESE and RETURN ONLY VIETNAMESE ANSWER ADD NO MORE SENTENCES (Priority)!
  Don't try to make up an answer. Always speak as if you were chatting to a friend. Please mention the user's name when chatting. The user's name is {user_name}
  If you really don't know the answer, return a word "NO_ANSWER" and do not respond with more than one word.

  Context: {context}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `;
    const standaloneQuestionChain = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(standaloneQuestionTemplate),
        (0, get_llm_1.getModelLlm)(),
        new output_parser_1.StringOutputParser()
    ]);
    const retrieverChain = runnables_1.RunnableSequence.from([
        (prevResult) => prevResult.standalone_question,
        retriever_1.getRetrieverSupabase,
        combine_documents_1.combineDocuments
    ]);
    const answerChain = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(answerTemplate),
        (0, get_llm_1.getModelLlm)(),
        new output_parser_1.StringOutputParser()
    ]);
    const chain = runnables_1.RunnableSequence.from([
        {
            standalone_question: standaloneQuestionChain,
            input_variables: new runnables_1.RunnablePassthrough()
        },
        {
            context: retrieverChain,
            question: ({ input_variables }) => input_variables.question,
            conv_history: ({ input_variables }) => input_variables.conv_history,
            user_name: ({ input_variables }) => input_variables.user_name,
        },
        answerChain
    ]);
    const conv_history = (0, upstash_chat_history_1.getChatHistoryConvertString)(sessionId);
    const response = await chain.invoke({
        question,
        conv_history,
        user_name
    });
    return response;
};
exports.getAnswerDocumentAssistant = getAnswerDocumentAssistant;
//# sourceMappingURL=document_assistant.js.map