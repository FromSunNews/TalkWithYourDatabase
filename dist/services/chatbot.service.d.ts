export declare const ChatbotService: {
    getAnswer: (data: {
        sessionId: string;
        question: string;
        user_name: string;
    }) => Promise<string>;
};
