import { env } from '../config/environment';
import { MessengerProvider } from '../providers/messenger';
import { ChatbotService } from '../services/chatbot.service'
import { HttpStatusCode } from '../utilities/constants'
import { Request, Response } from 'express'

const getAnswerPOST = async (req: Request, res: Response) => {
  try {
    let body = req.body;
    console.log("🚀 ~ getAnswerPOST ~ body:", body)
    let senderId = body.entry[0].messaging[0].sender.id;
    let query = body.entry[0].messaging[0].message.text;

    // await MessengerProvider.setTypingOn(senderId);

    const result = await ChatbotService.getAnswer({
      sessionId: senderId,
      question: query,
      user_name: "Phương"
    })
    console.log("🚀 ~ getAnswerPOST ~ result:", result)

    await MessengerProvider.sendMessage(senderId, result);

    // await MessengerProvider.setTypingOff(senderId);

    console.log(senderId);
    console.log(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(HttpStatusCode.INTERNAL_SERVER).json({
        errors: error.message
      })
    }
  }
}

const checkConnectionMessenger = async (req: Request, res: Response) => {
  try {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
      if (mode === 'subscribe' && token === env.VERIFY_TOKEN_MESSENGER) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.send('403 Invalid verify token');
        res.sendStatus(403);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(HttpStatusCode.INTERNAL_SERVER).json({
        errors: error.message
      })
    }
  }
}

export const ChatbotController = {
  getAnswerPOST,
  checkConnectionMessenger
}
