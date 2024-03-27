"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const getAnswer = async (data) => {
    try {
        const { sessionId, question, user_name } = data;
        // const result = await getAnswerChatBot(sessionId, question, user_name);
        const result = "Đây là trả lời từ Nodejs";
        return result;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("🚀 ~ getAnswer ~ error:", error);
        }
    }
    return "";
};
exports.ChatbotService = {
    getAnswer
};
//# sourceMappingURL=chatbot.service.js.map