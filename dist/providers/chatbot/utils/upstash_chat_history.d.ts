export declare const getChatHistoryBasic: (sessionId: string) => Promise<import("langchain/schema").BaseMessage[]>;
export declare const getChatHistoryConvertString: (sessionId: string) => Promise<string>;
export declare const addChatHistory: (sessionId: string, input: string, response: string) => Promise<void>;
