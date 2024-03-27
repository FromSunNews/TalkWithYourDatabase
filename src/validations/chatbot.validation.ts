import Joi from 'joi'
import { HttpStatusCode } from '../utilities/constants'
import { NextFunction, Request, Response } from 'express'
import { ConfigOptions } from 'common/interfaces/ConfigOptions.interface'

const getAnswer = async (req: Request, res: Response, next: NextFunction) => {
  console.log("🚀 ~ getAnswer ~ req:", req.body)
  const condition = Joi.object<ConfigOptions>({
    message: Joi.string().required(),
    returnSources: Joi.boolean().required(),
    returnFollowUpQuestions: Joi.boolean().required(),
    embedSourcesInLLMResponse: Joi.boolean().required(),
    textChunkSize: Joi.number().required(),
    textChunkOverlap: Joi.number().required(),
    numberOfSimilarityResults: Joi.number().required(),
    numberOfPagesToScan: Joi.number().required()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    if (error instanceof Error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        errors: error
      })
    }
  }
}

export const ChatbotValidation = {
  getAnswer
}
