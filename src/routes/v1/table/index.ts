import express from 'express'
import authRouter from '@/routes/v1/table/auth'
import passport from 'passport'
import CheckTokenBlacklist from '@/http/middleware/CheckTokenBlacklist'

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

export default tableRouter
