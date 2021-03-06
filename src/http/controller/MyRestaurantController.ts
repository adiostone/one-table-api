import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import Owner from '@/models/Owner'

interface GetResponseBody {
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
  isPaused: boolean
  holiday: string
  registeredAt: Date
}

interface CreateRequestBody {
  name: string
  introduction: string
  icon?: string
  category: string
  minOrderPrice?: number
  deliveryCost: number
  nonF2FCost: number
  packagingCost: number
  phoneNumber: string
  latitude: number
  longitude: number
  address1: string
  address2: string | null
  holiday?: string
}

interface UpdateRequestBody {
  name?: string
  introduction?: string
  icon?: string
  category?: string
  minOrderPrice?: number
  deliveryCost?: number
  packagingCost?: number
  nonF2FCost?: number
  phoneNumber?: string
  latitude?: number
  longitude?: number
  address1?: string
  address2?: string
  isPaused?: boolean
  holiday?: string
}

interface GetCategoriesResponseBody {
  categories: string[]
}

export default class MyRestaurantController {
  public static getRestaurant: SimpleHandler = (req, res) => {
    const restaurant = res.locals.restaurant as Restaurant

    const responseBody: GetResponseBody = {
      name: restaurant.get('name'),
      introduction: restaurant.get('introduction'),
      icon: restaurant.get('icon'),
      category: restaurant.get('category'),
      minOrderPrice: restaurant.get('minOrderPrice'),
      deliveryCost: restaurant.get('deliveryCost'),
      packagingCost: restaurant.get('packagingCost'),
      nonF2FCost: restaurant.get('nonF2FCost'),
      phoneNumber: restaurant.get('phoneNumber'),
      latitude: restaurant.get('latitude'),
      longitude: restaurant.get('longitude'),
      address1: restaurant.get('address1'),
      address2: restaurant.get('address2'),
      isPaused: restaurant.get('isPaused'),
      holiday: restaurant.get('holiday'),
      registeredAt: restaurant.get('registeredAt')
    }

    res.status(200).json(responseBody)
  }

  public static createRestaurant: SimpleHandler = async (req, res) => {
    const owner = req.user as Owner
    const restaurant = await Restaurant.findOne({
      where: { ownerID: owner.get('id') }
    })

    if (restaurant !== null) {
      res.status(409).json({
        err: {
          msg: 'Restaurant already exists'
        }
      })
    } else {
      const requestBody: CreateRequestBody = req.body
      Object.assign(requestBody, {
        ownerID: owner.get('id')
      })

      await Restaurant.create(requestBody)

      res.status(204).json()
    }
  }

  public static updateRestaurant: SimpleHandler = async (req, res) => {
    const restaurant = res.locals.restaurant as Restaurant
    const requestBody: UpdateRequestBody = req.body

    await restaurant.update(requestBody)

    res.status(204).json()
  }

  public static deleteRestaurant: SimpleHandler = async (req, res) => {
    const restaurant = res.locals.restaurant as Restaurant
    await restaurant.destroy()

    res.status(204).json()
  }

  public static getCategories: SimpleHandler = (req, res) => {
    const responseBody: GetCategoriesResponseBody = {
      categories: Restaurant.rawAttributes.category.values
    }

    res.status(200).json(responseBody)
  }
}
