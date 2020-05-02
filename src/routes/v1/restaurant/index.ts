import express from 'express'
import authRouter from '@/routes/v1/restaurant/auth'

const restaurantRouter = express.Router()

restaurantRouter.use('/auth', authRouter)

export default restaurantRouter
