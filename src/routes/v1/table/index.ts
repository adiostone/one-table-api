import express from 'express'
import authRouter from '@/routes/v1/table/auth'
import meRouter from '@/routes/v1/table/me'
import { CheckUserSignIn } from '@/http/middleware/combinedMiddleware'
import passport from 'passport'
import CheckTokenBlacklist from '@/http/middleware/CheckTokenBlacklist'
import TablePartyController from '@/http/controller/TablePartyController'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'

const tableRouter = express.Router()

tableRouter.use('/auth', authRouter)
tableRouter.use('/me', CheckUserSignIn, meRouter)


/**
 * GET: Start party websocket connection
 */
tableRouter
  .route('/party')
  .get(
    passport.authenticate('jwt-access-table', { session: false }),
    CheckTokenBlacklist.handler,
    TablePartyController.upgradeToWebSocket
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default tableRouter
