import express from 'express'
import authRouter from '@/routes/v1/restaurant/auth'
import { CheckOwnerSignIn } from '@/http/middleware/combinedMiddleware'
import meRouter from '@/routes/v1/restaurant/me'

const restaurantRouter = express.Router()

restaurantRouter.use('/auth', authRouter)
restaurantRouter.use('/me', CheckOwnerSignIn, meRouter)

export default restaurantRouter
