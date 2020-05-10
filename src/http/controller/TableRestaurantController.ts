import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'

interface RestaurantBody {
  name: string
  icon: string | null
  category: string
  minOrderPrice: number
}

interface GetResponseBody {
  restaurants: RestaurantBody[]
}

export default class TableRestaurantController {
  public static getNearRestaurants: SimpleHandler = async (req, res) => {
    const category = req.query.category
    const categorySet = Restaurant.rawAttributes.category.values

    if (!categorySet.includes(category)) {
      res.status(400).json({
        err: {
          msg: 'Invalid request',
          detail: 'Invalid category'
        }
      })

      return
    }

    const restaurants = await Restaurant.findAll({
      where: { category: category, isPaused: false },
      attributes: ['name', 'icon', 'category', 'minOrderPrice']
    })

    const responseBody: GetResponseBody = {
      restaurants: restaurants
    }

    res.status(200).json(responseBody)
  }
}
