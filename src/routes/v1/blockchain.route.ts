import express from 'express'

// Import from controllers
import { BlockchainController } from '../../controllers/blockchain.controller'

// Import from validations
import { BlockchainValidation } from '../../validations/blockchain.validation'

const router = express.Router()

router.route('/add_new_block')
  .post(BlockchainValidation.addNewBlock, BlockchainController.addNewBlock)

export const blockchainRoutes = router
