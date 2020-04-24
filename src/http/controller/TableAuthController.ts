import { SimpleHandler } from '@/http/HttpHandler'
import User from '@/models/User'
import url from 'url'

export default class TableAuthController {
  public static handshake: SimpleHandler = async (req, res) => {
    const user = req.user as User
    let handshakingItems

    // TODO: create tokens

    if (user.isNewRecord) {
      await user.save()

      handshakingItems = {
        isnew: true
      }
    } else {
      handshakingItems = {}
    }

    res.redirect(
      url.format({
        pathname: process.env.TB_HANDSHAKE_URL,
        query: handshakingItems
      })
    )
  }
}
