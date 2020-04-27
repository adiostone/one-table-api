import express from 'express'
import authRouter from '@/routes/v1/table/auth'

const tableRouter = express.Router()

tableRouter.use('/auth', authRouter)

// // example router
// tableRouter.get(
//   '/test',
//   passport.authenticate('jwt-access-table', { session: false }),
//   CheckTokenBlacklist.handler,
//   (req, res) => {
//     res.send('good!')
//   }
// )

export default tableRouter
