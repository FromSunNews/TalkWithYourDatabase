import { PromptTemplate } from "langchain/prompts";
import { getModelLlm } from "./utils/get_llm";
import { StringOutputParser } from "langchain/schema/output_parser";
import { RunnablePassthrough, RunnableSequence, RunnableBranch } from "@langchain/core/runnables"
import { ParamsFromFString } from "@langchain/core/prompts";
import { promptRole } from "./utils/prompt";
import { addChatHistory, getChatHistoryConvertString } from "./utils/upstash_chat_history";


export const getSimplificationOutput = async (sessionId: string, question: string, user_name: string): Promise<string> => {
  const promptTemplate = PromptTemplate.fromTemplate(`${promptRole}          
      Please utilize the conversation history and questions to see if you can craft your own responses from there. If possible, please return the answer in Vietnamese as well.
      Avoid fabricating an answer. Always speak as if you're chatting with a friend. Remember to mention the user's name when chatting. The user's name is {user_name}. If you genuinely don't know the answer, return "NO_ANSWER".
      Note that if the user asks a question about the job, "NO_ANSWER" is returned immediately.

      <chat_history>
      {chat_history}
      </chat_history>

      <question>
      {question}
      </question>

      Answer:`);

  const chain = RunnableSequence.from([
    promptTemplate,
    getModelLlm,
    new StringOutputParser(),
  ]);

  const chat_history = await getChatHistoryConvertString(sessionId);
  // console.log("🚀 ~ getSimplificationOutput ~ chat_history:", chat_history)

  const respone = await chain.invoke({
    user_name,
    chat_history: "",
    question
  });
  return respone;
} 