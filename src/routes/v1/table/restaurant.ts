import express from 'express'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import TableRestaurantController from '@/http/controller/TableRestaurantController'

const restaurantRouter = express.Router()

restaurantRouter
  .route('/')
  .get(TableRestaurantController.getNearRestaurants)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default restaurantRouter
