import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";

export const getModelOpenAI = (): ChatOpenAI<ChatOpenAICallOptions> => {
  return new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
}


export const getModelLlama = (): ChatGroq => {
  const openai = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
  });
  return openai;
}

export const getModelLlm = (): ChatGroq => {
  const openai = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
  });
  return openai;
}