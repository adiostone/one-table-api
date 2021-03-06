import express from 'express'
import authRouter from '@/routes/v1/table/auth'
import meRouter from '@/routes/v1/table/me'
import { CheckUserSignIn } from '@/http/middleware/combinedMiddleware'
import TablePartyController from '@/http/controller/TablePartyController'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import restaurantRouter from '@/routes/v1/table/restaurant'

const tableRouter = express.Router()

tableRouter.use('/auth', authRouter)
tableRouter.use('/me', CheckUserSignIn, meRouter)
tableRouter.use('/restaurants', CheckUserSignIn, restaurantRouter)

/**
 * GET: Start party websocket connection
 */
tableRouter
  .route('/party')
  .get(CheckUserSignIn, TablePartyController.upgradeToWebSocket)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default tableRouter
