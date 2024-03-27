/* eslint-disable no-unreachable */
import { getAnswerChatBot } from "providers/chatbot";

const getAnswer = async (data: { sessionId: string, question: string, user_name: string }): Promise<string> => {
  try {
    const { sessionId, question, user_name } = data;
    // const result = await getAnswerChatBot(sessionId, question, user_name);
    const result = "Đây là trả lời từ Nodejs"
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.log("🚀 ~ getAnswer ~ error:", error)
    }
  }
  return "";
}

export const ChatbotService = {
  getAnswer
}
