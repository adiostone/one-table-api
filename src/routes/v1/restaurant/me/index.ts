import express from 'express'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import OwnerProfileController from '@/http/controller/OwnerProfileController'
import restaurantRouter from '@/routes/v1/restaurant/me/restaurant'

const meRouter = express.Router()

meRouter.use('/restaurant', restaurantRouter)

meRouter
  .route('/profile')
  .get(OwnerProfileController.getProfile)
  .patch(OwnerProfileController.updateProfile)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default meRouter
