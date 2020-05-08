import { SimpleHandler } from '@/http/HttpHandler'
import User from '@/models/User'
import JWTHelper from '@/modules/internal/JWTHelper'
import url from 'url'
import UserToken from '@/models/UserToken'
import RedisConnector from '@/modules/database/RedisConnector'

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
    items.access = JWTHelper.issueTableAccessToken(user.get('id'))
    items.refresh = JWTHelper.issueTableRefreshToken()

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

  public static refresh: SimpleHandler = async (req, res) => {
    const refreshToken = req.headers.authorization.split(' ')[1]

    // check if refresh token is valid
    const userToken = await UserToken.findByPk(refreshToken)
    if (userToken === null) {
      res.status(401).send('Unauthorized')
      return
    }

    const body = {} as RefreshResponseBody

    // reissue access token
    body.access = JWTHelper.issueTableAccessToken(userToken.get('userID'))

    // check if refresh token is soon expired
    if (JWTHelper.isRefreshTokenSoonExpired(refreshToken)) {
      // reissue refresh token
      body.refresh = JWTHelper.issueTableRefreshToken()
      await UserToken.create({
        refresh: body.refresh,
        userID: userToken.get('userID')
      })

      // remove previous refresh token
      await userToken.destroy()
    }

    res.status(200).json(body)
  }

  public static signOut: SimpleHandler = async (req, res) => {
    const accessToken = req.headers.authorization.split(' ')[1]
    await RedisConnector.I.conn.setex(
      accessToken,
      JWTHelper.ttlOfToken(accessToken),
      'blacklist'
    )

    res.status(204).json()
  }
}
