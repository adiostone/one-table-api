import express from 'express'
import authRouter from '@/routes/v1/table/auth'
import meRouter from '@/routes/v1/table/me'
import { CheckUserSignIn } from '@/http/middleware/combinedMiddleware'

const tableRouter = express.Router()

tableRouter.use('/auth', authRouter)
tableRouter.use('/me', CheckUserSignIn, meRouter)

export default tableRouter
