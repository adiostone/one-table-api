import express from 'express'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import OwnerProfileController from '@/http/controller/OwnerProfileController'

const meRouter = express.Router()

meRouter
  .route('/profile')
  .get(OwnerProfileController.getProfile)
  .patch(OwnerProfileController.updateProfile)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default meRouter
