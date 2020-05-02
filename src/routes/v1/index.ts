import express from 'express'
import tableRouter from '@/routes/v1/table'
import restaurantRouter from '@/routes/v1/restaurant'

const v1Router = express.Router()

v1Router.use('/table', tableRouter)
v1Router.use('/restaurant', restaurantRouter)

export default v1Router
