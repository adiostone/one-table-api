import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import MenuCategory from '@/models/MenuCategory'
import Menu from '@/models/Menu'
import User from '@/models/User'
import getDistance from '@/modules/internal/getDistance'

interface RestaurantBody {
  id: number
  name: string
  icon: string | null
  category: string
  minOrderPrice: number
  deliveryCost: number
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
  deliveryCost: number
  packagingCost: number
  nonF2FCost: number
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

    let restaurants = await Restaurant.findAll({
      where: { category: category, isPaused: false },
      attributes: [
        'id',
        'name',
        'icon',
        'category',
        'minOrderPrice',
        'deliveryCost',
        'latitude',
        'longitude'
      ]
    })

    // get current user's latitude and longitude
    let user = req.user as User
    user = await user.reload({
      include: [
        {
          association: User.associations.place,
          attributes: ['latitude', 'longitude']
        }
      ],
      plain: true
    })
    user = user.toJSON() as User

    // only contain near restaurants from the user
    restaurants = restaurants.filter(restaurant => {
      const currLatitude1 = restaurant.get('latitude')
      const currLongitude1 = restaurant.get('longitude')

      const distanceInKM = getDistance(
        currLatitude1,
        currLongitude1,
        user.place.latitude,
        user.place.longitude
      )

      return distanceInKM <= 3
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
        'deliveryCost',
        'packagingCost',
        'nonF2FCost',
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
              attributes: ['id', 'name', 'image', 'isSharing'],
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
