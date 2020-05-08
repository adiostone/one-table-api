import express from 'express'
import UserProfileController from '@/http/controller/UserProfileController'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'

const meRouter = express.Router()

meRouter
  .route('/profile')
  .get(UserProfileController.getProfile)
  .patch(UserProfileController.updateProfile)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default meRouter
