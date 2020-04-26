import express from 'express'
import tableRouter from '@/routes/v1/table'

const v1Router = express.Router()

v1Router.use('/table', tableRouter)

export default v1Router
