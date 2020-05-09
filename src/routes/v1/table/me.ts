import express from 'express'
import UserProfileController from '@/http/controller/UserProfileController'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import UserPlaceController from '@/http/controller/UserPlaceController'

const meRouter = express.Router()

meRouter
  .route('/profile')
  .get(UserProfileController.getProfile)
  .patch(UserProfileController.updateProfile)
  .all(HttpErrorHandler.methodNotAllowedHandler)

meRouter
  .route('/place')
  .get(UserPlaceController.getPlace)
  .patch(UserPlaceController.updatePlace)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default meRouter
