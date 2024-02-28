import Joi from 'joi'
import { HttpStatusCode } from '../utilities/constants'
import { NextFunction, Request, Response } from 'express'

const addNewBlock = async (req: Request, res: Response, next: NextFunction) => {
  console.log("🚀 ~ addNewBlock ~ req:", req.body)
  // const condition = Joi.object({
  //   sender: Joi.string().required(),
  //   recipient: Joi.string().required(),
  //   quantity: Joi.number().required()
  // })

  const condition = Joi.array().items({
    sender: Joi.string().required(),
    recipient: Joi.string().required(),
    quantity: Joi.number().required()
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

export const BlockchainValidation = {
  addNewBlock
}
