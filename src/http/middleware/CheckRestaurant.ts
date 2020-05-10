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
      res.status(200).json()
    } else {
      res.locals.restaurant = restaurant
      next()
    }
  }
}
