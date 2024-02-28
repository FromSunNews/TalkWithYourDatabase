import express from 'express'

// Import from utils
import { HttpStatusCode } from '../../utilities/constants'

// Import from routes
import { blockchainRoutes } from './blockchain.route'

const router = express.Router()

router.get('/status', (req, res) => res.status(HttpStatusCode.OK).json({ status: 'OK!' }))

// blockchain
router.use('/blockchain', blockchainRoutes)


export const apiV1 = router
