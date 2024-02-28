import { BlockchainService } from '../services/blockchain.service'
import { HttpStatusCode } from '../utilities/constants'
import { Request, Response } from 'express'

const addNewBlock = async (req: Request, res: Response) => {
  try {
    const result = await BlockchainService.addNewBlock(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    if (error instanceof Error) {
      res.status(HttpStatusCode.INTERNAL_SERVER).json({
        errors: error.message
      })
    }
  }
}


export const BlockchainController = {
  addNewBlock
}
