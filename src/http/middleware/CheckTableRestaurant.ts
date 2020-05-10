import { NextHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'

export default class CheckTableRestaurant {
  public static handler: NextHandler = async (req, res, next) => {
    const restaurantID = req.params.restaurantID

    const restaurant = await Restaurant.findByPk(restaurantID)

    if (restaurant === null || restaurant.get('isPaused')) {
      res.status(404).json({
        err: {
          msg: 'Menu category not exist'
        }
      })
    } else {
      res.locals.restaurant = restaurant
      next()
    }
  }
}
