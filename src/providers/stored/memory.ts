import { ChatOpenAI } from "@langchain/openai";
import { env } from "config/environment";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate } from "langchain/prompts";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";


export const handleMemory = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-1106",
    temperature: 0.2,
  });

  const prompt = ChatPromptTemplate.fromTemplate(`
    You are an AI assistant.
    History: {history}
    {input}
  `);

  const upstashChatHistory = new UpstashRedisChatMessageHistory({
    sessionId: "chat1",
    config: {
      url: env.UPSTASH_REDIS_REST_URL || "",
      token: env.UPSTASH_REDIS_REST_TOKEN || ""
    }
  })

  const memory = new BufferMemory({
    memoryKey: "history",
    chatHistory: upstashChatHistory
  })

  // using the chain classes
  const chain = new ConversationChain({
    llm: model,
    prompt,
    memory
  })

  const input = {
    input: "repeat my name!"
  }
  const response = await chain.invoke(input)
  console.log("🚀 ~ handleMemory ~ response:", response)
}