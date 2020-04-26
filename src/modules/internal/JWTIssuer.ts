import jwt from 'jsonwebtoken'
import ms from 'ms'

const TABLE_CONFIGS = {
  secret: process.env.TB_JWT_SECRET_KEY,
  issuer: process.env.TB_JWT_ISSUER,
  accessExpire: '1h',
  refreshExpire: '30d',
  maxAgeToRefresh: '7d'
}

interface DecodedRefreshToken {
  payload: {
    exp: number
  }
}

export default class JWTIssuer {
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
    const decoded = jwt.decode(token, { complete: true }) as DecodedRefreshToken
    const refreshThreshold = new Date(
      decoded.payload.exp * 1000 - ms(TABLE_CONFIGS.maxAgeToRefresh)
    )

    return Date.now() > refreshThreshold.getTime()
  }
}
