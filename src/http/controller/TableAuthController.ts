import { SimpleHandler } from '@/http/HttpHandler'
import User from '@/models/User'
import JWTIssuer from '@/modules/internal/JWTIssuer'
import url from 'url'
import UserToken from '@/models/UserToken'

interface HandshakingItems {
  access: string
  refresh: string
  isnew?: boolean
}

interface RefreshResponseBody {
  access: string
  refresh?: string
}

export default class TableAuthController {
  public static handshake: SimpleHandler = async (req, res) => {
    const user = req.user as User

    const items = {} as HandshakingItems

    // issue tokens
    items.access = JWTIssuer.issueTableAccessToken(user.get('id'))
    items.refresh = JWTIssuer.issueTableRefreshToken()

    if (user.isNewRecord) {
      await user.save()
      items.isnew = true
    }

    // save refresh token to database
    await UserToken.create({
      refresh: items.refresh,
      userID: user.get('id')
    })

    // redirect to handshaking place
    res.redirect(
      url.format({
        pathname: process.env.TB_HANDSHAKE_URL,
        query: items as {}
      })
    )
  }
}
