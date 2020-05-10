import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import Owner from '@/models/Owner'

interface GetResponseBody {
  name: string
  introduction: string
  icon: string | null
  category: string
  minOrderPrice: number
  phoneNumber: string
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
  phoneNumber: string
  address1: string
  address2?: string
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
      phoneNumber: restaurant.get('phoneNumber'),
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

  public static getCategories: SimpleHandler = (req, res) => {
    const responseBody: GetCategoriesResponseBody = {
      categories: Restaurant.rawAttributes.category.values
    }

    res.status(200).json(responseBody)
  }
}
