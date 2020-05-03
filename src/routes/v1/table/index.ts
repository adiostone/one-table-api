import express from 'express'
import authRouter from '@/routes/v1/table/auth'
import passport from 'passport'
import CheckTokenBlacklist from '@/http/middleware/CheckTokenBlacklist'
import TablePartyController from '@/http/controller/TablePartyController'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'

const tableRouter = express.Router()

tableRouter.use('/auth', authRouter)

// temp router for test
tableRouter.get(
  '/test',
  passport.authenticate('jwt-access-table', { session: false }),
  CheckTokenBlacklist.handler,
  (req, res) => {
    res.send('good!')
  }
)

/**
 * GET: Start party websocket connection
 *
 * TODO: Apply JWT authentication check
 */
tableRouter
  .route('/party')
  .get(TablePartyController.upgradeToWebSocket)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default tableRouter
