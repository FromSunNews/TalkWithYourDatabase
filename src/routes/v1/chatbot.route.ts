import express from 'express'

// Import from controllers
import { ChatbotController } from '../../controllers/chatbot.controller'

// Import from validations
import { ChatbotValidation } from '../../validations/chatbot.validation'

const router = express.Router()

router.route('/get_answer')
  .post(ChatbotController.getAnswerPOST)

router.route('/get_answer')
  .get(ChatbotController.checkConnectionMessenger)

export const chatbotRoutes = router
