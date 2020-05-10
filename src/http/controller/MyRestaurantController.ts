import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'

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
}
