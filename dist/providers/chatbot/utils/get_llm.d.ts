import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
export declare const getModelOpenAI: () => ChatOpenAI<ChatOpenAICallOptions>;
export declare const getModelLlama: () => ChatGroq;
export declare const getModelLlm: () => ChatGroq;
