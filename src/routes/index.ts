import express from 'express'
import v1Router from '@/routes/v1'

const mainRouter = express.Router()

mainRouter.use('/v1', v1Router) // api versioning

export default mainRouter
