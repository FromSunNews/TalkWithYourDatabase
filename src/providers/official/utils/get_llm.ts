import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";

export const getModelLlm = (): ChatOpenAI<ChatOpenAICallOptions> => {
  return new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
}