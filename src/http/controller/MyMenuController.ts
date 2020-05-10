import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import MenuCategory from '@/models/MenuCategory'
import Menu from '@/models/Menu'
import MenuPrice from '@/models/MenuPrice'

interface GetAllMenusResponseBody {
  categories: {}[]
}

interface CreateMenuCategoryRequestBody {
  name: string
}

interface CreateMenuCategoryResponseBody {
  createdID: number
}

interface UpdateMenuCategoryRequestBody {
  name?: string
}

interface MenuPriceBody {
  quantity?: string
  price: number
}

interface CreateMenuRequestBody {
  name: string
  prices: MenuPriceBody[]
}

interface CreateMenuResponseBody {
  createdID: number
}

interface UpdateMenuRequestBody {
  name?: string
  prices?: MenuPriceBody[]
}

export default class MyMenuController {
  public static getAllMenus: SimpleHandler = async (req, res) => {
    let restaurant = res.locals.restaurant as Restaurant

    restaurant = await restaurant.reload({
      include: [
        {
          association: Restaurant.associations.menuCategories,
          attributes: ['name'],
          include: [
            {
              association: MenuCategory.associations.menus,
              attributes: ['name'],
              include: [
                {
                  association: Menu.associations.prices,
                  attributes: ['quantity', 'price']
                }
              ]
            }
          ]
        }
      ]
    })

    const responseBody: GetAllMenusResponseBody = {
      categories: restaurant.get('menuCategories')
    }

    res.json(responseBody)
  }

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

  public static createMenu: SimpleHandler = async (req, res) => {
    const menuCategory = res.locals.menuCategory as MenuCategory
    const requestBody: CreateMenuRequestBody = req.body

    const prices = requestBody.prices
    delete requestBody.prices
    Object.assign(requestBody, {
      categoryID: menuCategory.get('id')
    })

    await Menu.create(requestBody)
    const createdMenu = await Menu.findOne({
      where: { categoryID: menuCategory.get('id'), name: requestBody.name }
    })

    for (const price of prices) {
      Object.assign(price, {
        menuID: createdMenu.get('id')
      })
    }

    await MenuPrice.bulkCreate(prices)

    const responseBody: CreateMenuResponseBody = {
      createdID: createdMenu.get('id')
    }

    res.status(200).json(responseBody)
  }

  public static updateMenu: SimpleHandler = async (req, res) => {
    const menu = res.locals.menu as Menu
    const requestBody: UpdateMenuRequestBody = req.body

    const prices = requestBody.prices
    delete requestBody.prices

    await menu.update(requestBody)

    if (prices) {
      await MenuPrice.destroy({
        where: { menuID: menu.get('id') }
      })

      for (const price of prices) {
        Object.assign(price, {
          menuID: menu.get('id')
        })
      }

      await MenuPrice.bulkCreate(prices)
    }

    res.status(204).json()
  }

  public static deleteMenu: SimpleHandler = async (req, res) => {
    const menu = res.locals.menu as Menu
    await menu.destroy()

    res.status(204).json()
  }
}
