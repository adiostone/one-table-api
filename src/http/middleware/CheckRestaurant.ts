import { NextHandler } from '@/http/HttpHandler'
import Owner from '@/models/Owner'
import Restaurant from '@/models/Restaurant'

export default class CheckRestaurant {
  public static handler: NextHandler = async (req, res, next) => {
    const owner = req.user as Owner
    const restaurant = await Restaurant.findOne({
      where: { ownerID: owner.get('id') }
    })

    if (restaurant === null) {
      res.status(404).json({
        err: {
          msg: 'Restaurant not exist'
        }
      })
    } else {
      res.locals.restaurant = restaurant
      next()
    }
  }
}
