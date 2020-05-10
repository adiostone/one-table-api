import express from 'express'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import CheckRestaurant from '@/http/middleware/CheckRestaurant'
import MyRestaurantController from '@/http/controller/MyRestaurantController'

const restaurantRouter = express.Router()

restaurantRouter
  .route('/')
  .get(CheckRestaurant.handler, MyRestaurantController.getRestaurant)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default restaurantRouter
