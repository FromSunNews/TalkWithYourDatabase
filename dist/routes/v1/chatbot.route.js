"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotRoutes = void 0;
const express_1 = __importDefault(require("express"));
// Import from controllers
const chatbot_controller_1 = require("../../controllers/chatbot.controller");
const router = express_1.default.Router();
router.route('/get_answer')
    .post(chatbot_controller_1.ChatbotController.getAnswerPOST);
router.route('/get_answer')
    .get(chatbot_controller_1.ChatbotController.checkConnectionMessenger);
exports.chatbotRoutes = router;
//# sourceMappingURL=chatbot.route.js.map