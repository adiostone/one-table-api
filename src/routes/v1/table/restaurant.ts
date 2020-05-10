import express from 'express'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import TableRestaurantController from '@/http/controller/TableRestaurantController'
import CheckTableRestaurant from '@/http/middleware/CheckTableRestaurant'

const restaurantRouter = express.Router()

restaurantRouter.use('/:restaurantID', CheckTableRestaurant.handler)

restaurantRouter
  .route('/')
  .get(TableRestaurantController.getNearRestaurants)
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/:restaurantID')
  .get()
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default restaurantRouter
