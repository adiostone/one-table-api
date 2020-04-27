import { NextHandler } from '@/http/HttpHandler'
import RedisConnector from '@/modules/database/RedisConnector'

export default class CheckTokenBlacklist {
  /**
   * Check if user's access token is in the blacklist.
   * If so, 401 error.
   *
   * @param req
   * @param res
   * @param next
   */
  public static handler: NextHandler = async (req, res, next) => {
    const accessToken = req.headers.authorization.split(' ')[1]
    const value = await RedisConnector.I.conn.get(accessToken)

    if (value === 'blacklist') {
      res.status(401).json('Unauthorized')
    } else {
      next()
    }
  }
}
