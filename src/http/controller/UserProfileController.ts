import { SimpleHandler } from '@/http/HttpHandler'
import User from '@/models/User'

interface GetResponse {
  email: string
  nickname: string
  image: string | null
}

interface UpdateRequest {
  nickname?: string
  image?: string
}

export default class UserProfileController {
  public static getProfile: SimpleHandler = (req, res) => {
    const user = req.user as User

    const responseBody: GetResponse = {
      email: user.get('email'),
      nickname: user.get('nickname'),
      image: user.get('image')
    }

    res.status(200).json(responseBody)
  }

  public static updateProfile: SimpleHandler = async (req, res) => {
    const user = req.user as User
    const requestBody: UpdateRequest = req.body

    if (requestBody.nickname) {
      user.set('nickname', requestBody.nickname)
    }

    if (requestBody.image) {
      user.set('image', requestBody.image)
    }

    await user.save()

    res.status(204).json()
  }
}
