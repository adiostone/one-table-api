import express from 'express'
import authRouter from '@/routes/v1/table/auth'
import passport from 'passport'
import CheckTokenBlacklist from '@/http/middleware/CheckTokenBlacklist'
import TablePartyController from '@/http/controller/TablePartyController'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import User from '@/models/User'

const tableRouter = express.Router()

tableRouter.use('/auth', authRouter)

// temp router for test
tableRouter.get(
  '/test',
  passport.authenticate('jwt-access-table', { session: false }),
  CheckTokenBlacklist.handler,
  (req, res) => {
    const user = req.user as User
    res.json({ msg: 'hello ' + user.get('name') })
  }
)

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
