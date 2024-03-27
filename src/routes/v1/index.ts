import express from 'express'

// Import from utils
import { HttpStatusCode } from '../../utilities/constants'

// Import from routes
import { chatbotRoutes } from './chatbot.route'

const router = express.Router()

router.get('/status', (req, res) => res.status(HttpStatusCode.OK).json({ status: 'OK!' }))

// chatbot
router.use('/chatbot', chatbotRoutes)


export const apiV1 = router
