import express from 'express'
import authRouter from '@/routes/v1/table/auth'

const tableRouter = express.Router()

tableRouter.use('/auth', authRouter)

export default tableRouter
