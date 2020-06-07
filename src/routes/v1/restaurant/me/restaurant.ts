import express from 'express'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import CheckRestaurant from '@/http/middleware/CheckRestaurant'
import MyRestaurantController from '@/http/controller/MyRestaurantController'
import MyMenuController from '@/http/controller/MyMenuController'
import CheckMenuCategory from '@/http/middleware/CheckMenuCategory'
import CheckMenu from '@/http/middleware/CheckMenu'
import RestaurantOrderManagingController from '@/http/controller/RestaurantOrderManagingController'

const restaurantRouter = express.Router()

restaurantRouter.use('/menu-category', CheckRestaurant.handler)
restaurantRouter.use('/menu-category/:categoryID', CheckMenuCategory.handler)
restaurantRouter.use(
  '/menu-category/:categoryID/menu/:menuID',
  CheckMenu.handler
)

restaurantRouter
  .route('/')
  .get(CheckRestaurant.handler, MyRestaurantController.getRestaurant)
  .post(MyRestaurantController.createRestaurant)
  .patch(CheckRestaurant.handler, MyRestaurantController.updateRestaurant)
  .delete(CheckRestaurant.handler, MyRestaurantController.deleteRestaurant)
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/order-managing')
  .get(
    CheckRestaurant.handler,
    RestaurantOrderManagingController.upgradeToWebSocket
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/categories')
  .get(MyRestaurantController.getCategories)
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/all-menus')
  .get(CheckRestaurant.handler, MyMenuController.getAllMenus)
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/menu-category')
  .post(MyMenuController.createMenuCategory)
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/menu-category/:categoryID')
  .patch(MyMenuController.updateMenuCategory)
  .delete(MyMenuController.deleteMenuCategory)
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/menu-category/:categoryID/menu')
  .post(MyMenuController.createMenu)
  .all(HttpErrorHandler.methodNotAllowedHandler)

restaurantRouter
  .route('/menu-category/:categoryID/menu/:menuID')
  .patch(MyMenuController.updateMenu)
  .delete(MyMenuController.deleteMenu)
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default restaurantRouter
