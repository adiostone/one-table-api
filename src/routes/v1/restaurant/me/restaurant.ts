import express from 'express'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import CheckRestaurant from '@/http/middleware/CheckRestaurant'
import MyRestaurantController from '@/http/controller/MyRestaurantController'

const restaurantRouter = express.Router()

restaurantRouter
  .route('/')
  .get(CheckRestaurant.handler, MyRestaurantController.getRestaurant)
  .post(MyRestaurantController.createRestaurant)
  .patch(CheckRestaurant.handler, MyRestaurantController.updateRestaurant)
  .delete(CheckRestaurant.handler, MyRestaurantController.deleteRestaurant)
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/categories')
  .get(MyRestaurantController.getCategories)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default restaurantRouter
