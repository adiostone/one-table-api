import { SimpleHandler } from '@/http/HttpHandler'
import User from '@/models/User'
import UserPlace from '@/models/UserPlace'

interface GetResponseBody {
  latitude: number
  longitude: number
  address1: string
  address2: string | null
}

interface UpdateRequestBody {
  latitude?: number
  longitude?: number
  address1?: string
  address2?: string | null
}

export default class UserPlaceController {
  public static getPlace: SimpleHandler = async (req, res) => {
    const user = req.user as User
    const userPlace = await UserPlace.findByPk(user.get('id'))

    if (userPlace === null) {
      res.status(200).json({})
    } else {
      const body: GetResponseBody = {
        latitude: userPlace.get('latitude'),
        longitude: userPlace.get('longitude'),
        address1: userPlace.get('address1'),
        address2: userPlace.get('address2')
      }

      res.status(200).json(body)
    }
  }

  public static updatePlace: SimpleHandler = async (req, res) => {
    const user = req.user as User
    const userPlace = await UserPlace.findByPk(user.get('id'))
    const requestBody: UpdateRequestBody = req.body

    if (userPlace === null) {
      // if not exist, create
      await UserPlace.create({
        userID: user.get('id'),
        latitude: requestBody.latitude,
        longitude: requestBody.longitude,
        address1: requestBody.address1,
        address2: requestBody.address2
      })
    } else {
      // if exist, update
      userPlace.set(
        'latitude',
        requestBody.latitude || userPlace.get('latitude')
      )
      userPlace.set(
        'longitude',
        requestBody.longitude || userPlace.get('longitude')
      )
      userPlace.set(
        'address1',
        requestBody.address1 || userPlace.get('address1')
      )
      userPlace.set(
        'address2',
        requestBody.address2 || userPlace.get('address2')
      )

      await userPlace.save()
    }

    res.status(204).json()
  }
}
