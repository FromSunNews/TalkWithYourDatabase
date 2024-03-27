/* eslint-disable no-unreachable */
import { ConfigOptions } from "common/interfaces/ConfigOptions.interface";
import { getAnswerResearchAssistant } from "providers/research";

const getAnswer = async (datas: ConfigOptions) => {
  console.log("🚀 ~ getAnswer ~ datas:", datas)
  try {
    const result = await getAnswerResearchAssistant(datas);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(JSON.stringify(error));
    }
  }
}

export const ChatbotService = {
  getAnswer
}
