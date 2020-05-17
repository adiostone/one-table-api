import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import MenuCategory from '@/models/MenuCategory'
import Menu from '@/models/Menu'

interface RestaurantBody {
  id: number
  name: string
  icon: string | null
  category: string
  minOrderPrice: number
}

interface GetRestaurantsBody {
  restaurants: RestaurantBody[]
}

interface GetRestaurantDetailBody {
  id: number
  name: string
  introduction: string
  icon: string | null
  category: string
  minOrderPrice: number
  phoneNumber: string
  latitude: number
  longitude: number
  address1: string
  address2: string | null
  holiday: string
  registeredAt: Date
  menuCategories: {}[]
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
      attributes: ['id', 'name', 'icon', 'category', 'minOrderPrice']
    })

    const responseBody: GetRestaurantsBody = {
      restaurants: restaurants
    }

    res.status(200).json(responseBody)
  }

  public static getRestaurantDetail: SimpleHandler = async (req, res) => {
    const restaurant = res.locals.restaurant as Restaurant

    const detailedRestaurant = await Restaurant.findByPk(restaurant.get('id'), {
      attributes: [
        'id',
        'name',
        'introduction',
        'icon',
        'category',
        'minOrderPrice',
        'phoneNumber',
        'latitude',
        'longitude',
        'address1',
        'address2',
        'holiday',
        'registeredAt'
      ],
      include: [
        {
          association: Restaurant.associations.menuCategories,
          attributes: ['name'],
          include: [
            {
              association: MenuCategory.associations.menus,
              attributes: ['name', 'image'],
              include: [
                {
                  association: Menu.associations.prices,
                  attributes: ['quantity', 'price']
                }
              ]
            }
          ]
        }
      ],
      plain: true
    })

    const responseBody: GetRestaurantDetailBody = detailedRestaurant

    res.json(responseBody)
  }
}
