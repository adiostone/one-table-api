import { NextHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import MenuCategory from '@/models/MenuCategory'

export default class CheckMenuCategory {
  public static handler: NextHandler = async (req, res, next) => {
    const restaurant = res.locals.restaurant as Restaurant
    const categoryID = req.params.categoryID

    const menuCategory = await MenuCategory.findOne({
      where: { id: categoryID, restaurantID: restaurant.get('id') }
    })

    if (menuCategory === null) {
      res.status(200).json()
    } else {
      res.locals.menuCategory = menuCategory
      next()
    }
  }
}
