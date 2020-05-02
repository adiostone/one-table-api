import jwt from 'jsonwebtoken'
import ms from 'ms'

const TABLE_CONFIGS = {
  secret: process.env.TB_JWT_SECRET_KEY,
  issuer: process.env.TB_JWT_ISSUER,
  accessExpire: '1h',
  refreshExpire: '30d',
  maxAgeToRefresh: '7d'
}

const RESTAURANT_CONFIGS = {
  secret: process.env.RT_JWT_SECRET_KEY,
  issuer: process.env.RT_JWT_ISSUER,
  accessExpire: '1h',
  refreshExpire: '30d',
  maxAgeToRefresh: '7d'
}

interface DecodedPayload {
  exp: number
  iss: string
}

export default class JWTHelper {
  public static issueTableAccessToken(id: string): string {
    return jwt.sign({}, TABLE_CONFIGS.secret, {
      issuer: TABLE_CONFIGS.issuer,
      subject: id,
      expiresIn: TABLE_CONFIGS.accessExpire,
      notBefore: 1
    })
  }

  public static issueTableRefreshToken(): string {
    return jwt.sign({}, TABLE_CONFIGS.secret, {
      issuer: TABLE_CONFIGS.issuer,
      expiresIn: TABLE_CONFIGS.refreshExpire,
      notBefore: 1
    })
  }

  public static issueRestaurantAccessToken(id: string): string {
    return jwt.sign({}, RESTAURANT_CONFIGS.secret, {
      issuer: RESTAURANT_CONFIGS.issuer,
      subject: id,
      expiresIn: RESTAURANT_CONFIGS.accessExpire,
      notBefore: 1
    })
  }

  public static issueRestaurantRefreshToken(): string {
    return jwt.sign({}, RESTAURANT_CONFIGS.secret, {
      issuer: RESTAURANT_CONFIGS.issuer,
      expiresIn: RESTAURANT_CONFIGS.refreshExpire,
      notBefore: 1
    })
  }

  public static isRefreshTokenSoonExpired(token: string): boolean {
    const decoded = jwt.decode(token) as DecodedPayload

    let maxAgeToRefresh
    if (decoded.iss === TABLE_CONFIGS.issuer) {
      maxAgeToRefresh = TABLE_CONFIGS.maxAgeToRefresh
    } else {
      maxAgeToRefresh = RESTAURANT_CONFIGS.maxAgeToRefresh
    }

    const refreshThreshold = new Date(decoded.exp * 1000 - ms(maxAgeToRefresh))

    return Date.now() > refreshThreshold.getTime()
  }

  public static ttlOfToken(token: string): number {
    const decoded = jwt.decode(token) as DecodedPayload
    const expDate = new Date(decoded.exp * 1000)

    return Math.ceil((expDate.getTime() - new Date().getTime()) / 1000)
  }
}
