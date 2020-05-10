import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import MenuCategory from '@/models/MenuCategory'

interface CreateMenuCategoryRequestBody {
  name: string
}

export default class MyMenuController {
  public static createMenuCategory: SimpleHandler = async (req, res) => {
    const restaurant = res.locals.restaurant as Restaurant
    const requestBody: CreateMenuCategoryRequestBody = req.body

    const maxOrder: number = await MenuCategory.max('order', {
      where: { restaurantID: restaurant.get('id') }
    })

    Object.assign(requestBody, {
      restaurantID: restaurant.get('id'),
      order: maxOrder + 1
    })

    await MenuCategory.create(requestBody)

    res.status(204).json()
  }
}
