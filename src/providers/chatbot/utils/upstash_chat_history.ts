import { env } from "../../../config/environment";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";
import { getConvertChatHistory } from "./convert_chat_history";
import { AIMessage, HumanMessage } from "langchain/schema";


export const getChatHistoryBasic = async (sessionId: string) => {
  try {
    const upstashChatHistory = new UpstashRedisChatMessageHistory({
      sessionId,
      config: {
        url: env.UPSTASH_REDIS_REST_URL || "",
        token: env.UPSTASH_REDIS_REST_TOKEN || ""
      }
    });
    const basicChatHistory = await upstashChatHistory.getMessages();
    return basicChatHistory
  } catch (error: any) {
    throw new Error(error)
  }
}

export const getChatHistoryConvertString = async (sessionId: string) => {
  try {
    const basicChatHistory = await getChatHistoryBasic(sessionId);
    return getConvertChatHistory(basicChatHistory.splice(-5))
  } catch (error: any) {
    throw new Error(error)
  }
}

export const addChatHistory = async (sessionId: string, input: string, response: string) => {
  try {
    const upstashChatHistory = new UpstashRedisChatMessageHistory({
      sessionId,
      config: {
        url: env.UPSTASH_REDIS_REST_URL || "",
        token: env.UPSTASH_REDIS_REST_TOKEN || ""
      }
    });
    const result = await upstashChatHistory.addMessages([new HumanMessage(input), new AIMessage(response)]);
    // console.log("🚀 ~ addChatHistory ~ result:", result)
  } catch (error: any) {
    throw new Error(error)
  }
}


