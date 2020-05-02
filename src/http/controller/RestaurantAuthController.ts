import { SimpleHandler } from '@/http/HttpHandler'
import JWTHelper from '@/modules/internal/JWTHelper'
import url from 'url'
import RedisConnector from '@/modules/database/RedisConnector'
import Owner from '@/models/Owner'
import OwnerToken from '@/models/OwnerToken'

interface HandshakingItems {
  access: string
  refresh: string
  isnew?: boolean
}

interface RefreshResponseBody {
  access: string
  refresh?: string
}

export default class RestaurantAuthController {
  public static handshake: SimpleHandler = async (req, res) => {
    const owner = req.user as Owner

    const items = {} as HandshakingItems

    // issue tokens
    items.access = JWTHelper.issueRestaurantAccessToken(owner.get('id'))
    items.refresh = JWTHelper.issueRestaurantRefreshToken()

    if (owner.isNewRecord) {
      await owner.save()
      items.isnew = true
    }

    // save refresh token to database
    await OwnerToken.create({
      refresh: items.refresh,
      ownerID: owner.get('id')
    })

    // redirect to handshaking place
    res.redirect(
      url.format({
        pathname: process.env.RT_HANDSHAKE_URL,
        query: items as {}
      })
    )
  }

  public static refresh: SimpleHandler = async (req, res) => {
    const refreshToken = req.headers.authorization.split(' ')[1]

    // check if refresh token is valid
    const ownerToken = await OwnerToken.findByPk(refreshToken)
    if (ownerToken === null) {
      res.status(401).send('Unauthorized')
      return
    }

    const body = {} as RefreshResponseBody

    // reissue access token
    body.access = JWTHelper.issueRestaurantAccessToken(
      ownerToken.get('ownerID')
    )

    // check if refresh token is soon expired
    if (JWTHelper.isRefreshTokenSoonExpired(refreshToken)) {
      // reissue refresh token
      body.refresh = JWTHelper.issueRestaurantRefreshToken()
      await OwnerToken.create({
        refresh: body.refresh,
        ownerID: ownerToken.get('ownerID')
      })

      // remove previous refresh token
      await ownerToken.destroy()
    }

    res.json(body)
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
