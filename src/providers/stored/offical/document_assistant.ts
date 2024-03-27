import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { RunnablePassthrough, RunnableSequence, RunnableBranch } from "@langchain/core/runnables"
import readline from "readline";
import { UpstashRedisChatMessageHistory } from 'langchain/stores/message/upstash_redis';
import { env } from 'config/environment';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { getRetrieverSupabase } from '../../chatbot/utils/retriever';
import { combineDocuments } from '../../chatbot/utils/combine_documents';
import { getChatHistoryConvertString } from '../../chatbot/utils/upstash_chat_history';
import { getModelLlm } from '../../chatbot/utils/get_llm';
import { promptRole } from '../../chatbot/utils/prompt';

export const getAnswerDocumentAssistant = async (sessionId: string, question: string, user_name: string): Promise<string> => {

  const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
  Conversation history: {conv_history}
  Question: {question} 
  Standalone question:`


  const answerTemplate = `
  ${promptRole} 
  Based on the context provided and the conversation history. Try to find the answer in the context. Answer the question in Vietnamese by your own words based on the information found. 
  If the answer is not given in the context, find the answer in the conversation history if possible.
  Please answer in VIETNAMESE and RETURN ONLY VIETNAMESE ANSWER ADD NO MORE SENTENCES (Priority)!
  Don't try to make up an answer. Always speak as if you were chatting to a friend. Please mention the user's name when chatting. The user's name is {user_name}
  If you really don't know the answer, return a word "NO_ANSWER" and do not respond with more than one word.

  Context: {context}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `

  const standaloneQuestionChain = RunnableSequence.from([
    PromptTemplate.fromTemplate(standaloneQuestionTemplate),
    getModelLlm(),
    new StringOutputParser()
  ]);

  const retrieverChain = RunnableSequence.from([
    (prevResult: any) => prevResult.standalone_question,
    getRetrieverSupabase,
    combineDocuments
  ]);

  const answerChain = RunnableSequence.from([
    PromptTemplate.fromTemplate(answerTemplate),
    getModelLlm(),
    new StringOutputParser()
  ]);

  const chain = RunnableSequence.from([
    {
      standalone_question: standaloneQuestionChain,
      input_variables: new RunnablePassthrough()
    },
    {
      context: retrieverChain,
      question: ({ input_variables }) => input_variables.question,
      conv_history: ({ input_variables }) => input_variables.conv_history,
      user_name: ({ input_variables }) => input_variables.user_name,
    },
    answerChain
  ])

  const conv_history = getChatHistoryConvertString(sessionId);

  const response = await chain.invoke({
    question,
    conv_history,
    user_name
  });

  return response;
}