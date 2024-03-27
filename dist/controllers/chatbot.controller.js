"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotController = void 0;
const environment_1 = require("../config/environment");
const messenger_1 = require("../providers/messenger");
const chatbot_service_1 = require("../services/chatbot.service");
const constants_1 = require("../utilities/constants");
const getAnswerPOST = async (req, res) => {
    try {
        let body = req.body;
        console.log("🚀 ~ getAnswerPOST ~ body:", body);
        let senderId = body.entry[0].messaging[0].sender.id;
        let query = body.entry[0].messaging[0].message.text;
        // await MessengerProvider.setTypingOn(senderId);
        const result = await chatbot_service_1.ChatbotService.getAnswer({
            sessionId: senderId,
            question: query,
            user_name: "Phương"
        });
        console.log("🚀 ~ getAnswerPOST ~ result:", result);
        await messenger_1.MessengerProvider.sendMessage(senderId, result);
        // await MessengerProvider.setTypingOff(senderId);
        console.log(senderId);
        console.log(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(constants_1.HttpStatusCode.INTERNAL_SERVER).json({
                errors: error.message
            });
        }
    }
};
const checkConnectionMessenger = async (req, res) => {
    try {
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];
        if (mode && token) {
            if (mode === 'subscribe' && token === environment_1.env.VERIFY_TOKEN_MESSENGER) {
                console.log('WEBHOOK_VERIFIED');
                res.status(200).send(challenge);
            }
            else {
                res.send('403 Invalid verify token');
                res.sendStatus(403);
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(constants_1.HttpStatusCode.INTERNAL_SERVER).json({
                errors: error.message
            });
        }
    }
};
exports.ChatbotController = {
    getAnswerPOST,
    checkConnectionMessenger
};
//# sourceMappingURL=chatbot.controller.js.map