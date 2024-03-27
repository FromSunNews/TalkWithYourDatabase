import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { env } from "config/environment";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema";
import { StringOutputParser } from "langchain/schema/output_parser";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

export const getContextualQuestion = async (chat_history: BaseMessage[], question: string) => {

  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"),
    ["user", "Question {question}"],
    [
      "user",
      "Given the above conversation and question, generate a context include necessary infomation to look up in order to get information relevant to the conversation",
    ],
  ]);

  const chain = historyAwarePrompt.pipe(llm).pipe(new StringOutputParser());

  await chain.invoke({
    chat_history,
    question
  });
}

export const handleQuestion = async () => {
  const upstashChatHistory = new UpstashRedisChatMessageHistory({
    sessionId: "chat1",
    config: {
      url: env.UPSTASH_REDIS_REST_URL || "",
      token: env.UPSTASH_REDIS_REST_TOKEN || ""
    }
  });

  const chat_history = await upstashChatHistory.getMessages();
  const question = "Tôi vừa hỏi gì ?"
  const response = await getContextualQuestion(chat_history, question);
  console.log("🚀 ~ handleQuestion ~ response:", response)
}