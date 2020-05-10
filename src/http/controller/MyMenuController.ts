import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import MenuCategory from '@/models/MenuCategory'

interface CreateMenuCategoryRequestBody {
  name: string
}

interface CreateMenuCategoryResponseBody {
  createdID: number
}

interface UpdateMenuCategoryRequestBody {
  name?: string
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
    const createdMenuCategory = await MenuCategory.findOne({
      where: { restaurantID: restaurant.get('id'), name: requestBody.name }
    })

    const responseBody: CreateMenuCategoryResponseBody = {
      createdID: createdMenuCategory.get('id')
    }

    res.status(200).json(responseBody)
  }

  public static updateMenuCategory: SimpleHandler = async (req, res) => {
    const menuCategory = res.locals.menuCategory as MenuCategory
    const requestBody: UpdateMenuCategoryRequestBody = req.body

    await menuCategory.update(requestBody)

    res.status(204).json()
  }

  public static deleteMenuCategory: SimpleHandler = async (req, res) => {
    const menuCategory = res.locals.menuCategory as MenuCategory
    await menuCategory.destroy()

    res.status(204).json()
  }
}
