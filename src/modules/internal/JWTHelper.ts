import jwt from 'jsonwebtoken'
import ms from 'ms'

const TABLE_CONFIGS = {
  secret: process.env.TB_JWT_SECRET_KEY,
  issuer: process.env.TB_JWT_ISSUER,
  accessExpire: '1h',
  refreshExpire: '30d',
  maxAgeToRefresh: '7d'
}

interface DecodedPayload {
  exp: number
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

  public static isRefreshTokenSoonExpired(token: string): boolean {
    const decoded = jwt.decode(token) as DecodedPayload
    const refreshThreshold = new Date(
      decoded.exp * 1000 - ms(TABLE_CONFIGS.maxAgeToRefresh)
    )

    return Date.now() > refreshThreshold.getTime()
  }

  public static ttlOfToken(token: string): number {
    const decoded = jwt.decode(token) as DecodedPayload
    const expDate = new Date(decoded.exp * 1000)

    return Math.ceil((expDate.getTime() - new Date().getTime()) / 1000)
  }
}