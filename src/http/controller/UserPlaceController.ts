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
  address2?: string
}

export default class UserPlaceController {
  public static getPlace: SimpleHandler = async (req, res) => {
    const user = req.user as User
    const userPlace = await UserPlace.findByPk(user.get('id'))

    if (userPlace === null) {
      res.status(404).json({
        err: {
          msg: "This user's place not exist"
        }
      })
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
      Object.assign(requestBody, {
        userID: user.get('id')
      })

      await UserPlace.create(requestBody)
    } else {
      // if exist, update
      await userPlace.update(requestBody)
    }

    res.status(204).json()
  }
}
