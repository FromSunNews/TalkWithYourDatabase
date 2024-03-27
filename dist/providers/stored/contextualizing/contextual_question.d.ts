import { BaseMessage } from "langchain/schema";
export declare const getContextualQuestion: (chat_history: BaseMessage[], question: string) => Promise<void>;
export declare const handleQuestion: () => Promise<void>;
