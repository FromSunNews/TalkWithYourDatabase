import express from 'express'

// Import from controllers
import { ChatbotController } from '../../controllers/chatbot.controller'

// Import from validations
import { ChatbotValidation } from '../../validations/chatbot.validation'

const router = express.Router()

router.route('/get_answer')
  .post(ChatbotValidation.getAnswer, ChatbotController.getAnswer)

export const chatbotRoutes = router
