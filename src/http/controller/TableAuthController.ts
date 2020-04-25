import { SimpleHandler } from '@/http/HttpHandler'
import User from '@/models/User'
import JWTIssuer from '@/modules/internal/JWTIssuer'
import url from 'url'

export default class TableAuthController {
  public static handshake: SimpleHandler = async (req, res) => {
    const user = req.user as User

    // issue tokens
    const accessToken = JWTIssuer.issueTableAccessToken(user.id)
    const refreshToken = JWTIssuer.issueTableRefreshToken()

    let handshakingItems
    if (user.isNewRecord) {
      await user.save()

      handshakingItems = {
        access: accessToken,
        refresh: refreshToken,
        isnew: true // query for notifying that this user is new face
      }
    } else {
      handshakingItems = {
        access: accessToken,
        refresh: refreshToken
      }
    }

    // redirect to handshaking place
    res.redirect(
      url.format({
        pathname: process.env.TB_HANDSHAKE_URL,
        query: handshakingItems
      })
    )
  }
}
