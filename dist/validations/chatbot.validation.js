"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../utilities/constants");
const getAnswer = async (req, res, next) => {
    console.log("🚀 ~ getAnswer ~ req:", req.body);
    const condition = joi_1.default.object({
        message: joi_1.default.string().required(),
        returnSources: joi_1.default.boolean().required(),
        returnFollowUpQuestions: joi_1.default.boolean().required(),
        embedSourcesInLLMResponse: joi_1.default.boolean().required(),
        textChunkSize: joi_1.default.number().required(),
        textChunkOverlap: joi_1.default.number().required(),
        numberOfSimilarityResults: joi_1.default.number().required(),
        numberOfPagesToScan: joi_1.default.number().required()
    });
    try {
        await condition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(constants_1.HttpStatusCode.BAD_REQUEST).json({
                errors: error
            });
        }
    }
};
exports.ChatbotValidation = {
    getAnswer
};
//# sourceMappingURL=chatbot.validation.js.map