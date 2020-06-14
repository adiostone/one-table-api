import { SimpleHandler } from '@/http/HttpHandler'
import User from '@/models/User'

interface GetResponseBody {
  id: string
  email: string
  nickname: string
  image: string | null
  pushToken: string | null
  isHungry: boolean
}

interface UpdateRequestBody {
  nickname?: string
  image?: string
  pushToken?: string
  isHungry?: boolean
}

export default class UserProfileController {
  public static getProfile: SimpleHandler = (req, res) => {
    const user = req.user as User

    const responseBody: GetResponseBody = {
      id: user.get('id'),
      email: user.get('email'),
      nickname: user.get('nickname'),
      image: user.get('image'),
      pushToken: user.get('pushToken'),
      isHungry: user.get('isHungry')
    }

    res.status(200).json(responseBody)
  }

  public static updateProfile: SimpleHandler = async (req, res) => {
    const user = req.user as User
    const requestBody: UpdateRequestBody = req.body

    user.set('nickname', requestBody.nickname || user.get('nickname'))
    user.set('image', requestBody.image || user.get('image'))
    user.set('pushToken', requestBody.pushToken || user.get('pushToken'))
    user.set(
      'isHungry',
      requestBody.isHungry !== undefined
        ? requestBody.isHungry
        : user.get('isHungry')
    )

    await user.save()

    res.status(204).json()
  }
}
