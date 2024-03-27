"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiV1 = void 0;
const express_1 = __importDefault(require("express"));
// Import from utils
const constants_1 = require("../../utilities/constants");
// Import from routes
const chatbot_route_1 = require("./chatbot.route");
const router = express_1.default.Router();
router.get('/status', (req, res) => res.status(constants_1.HttpStatusCode.OK).json({ status: 'OK!' }));
// chatbot
router.use('/chatbot', chatbot_route_1.chatbotRoutes);
exports.apiV1 = router;
//# sourceMappingURL=index.js.map