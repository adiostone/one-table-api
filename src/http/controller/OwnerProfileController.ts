import { SimpleHandler } from '@/http/HttpHandler'
import Owner from '@/models/Owner'

interface GetResponseBody {
  email: string
  nickname: string
  image: string | null
}

interface UpdateRequestBody {
  nickname?: string
  image?: string
}

export default class OwnerProfileController {
  public static getProfile: SimpleHandler = (req, res) => {
    const owner = req.user as Owner

    const responseBody: GetResponseBody = {
      email: owner.get('email'),
      nickname: owner.get('nickname'),
      image: owner.get('image')
    }

    res.status(200).json(responseBody)
  }

  public static updateProfile: SimpleHandler = async (req, res) => {
    const owner = req.user as Owner
    const requestBody: UpdateRequestBody = req.body

    if (requestBody.nickname) {
      owner.set('nickname', requestBody.nickname)
    }

    if (requestBody.image) {
      owner.set('image', requestBody.image)
    }

    await owner.save()

    res.status(204).json()
  }
}
