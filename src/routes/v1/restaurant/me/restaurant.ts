import express from 'express'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import CheckRestaurant from '@/http/middleware/CheckRestaurant'
import MyRestaurantController from '@/http/controller/MyRestaurantController'
import MyMenuController from '@/http/controller/MyMenuController'
import CheckMenuCategory from '@/http/middleware/CheckMenuCategory'

const restaurantRouter = express.Router()

restaurantRouter.use('/menu-category', CheckRestaurant.handler)
restaurantRouter.use('/menu-category/:categoryID', CheckMenuCategory.handler)

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

restaurantRouter
  .route('/menu-category')
  .post(MyMenuController.createMenuCategory)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default restaurantRouter
