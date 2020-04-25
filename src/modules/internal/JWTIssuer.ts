import jwt from 'jsonwebtoken'

const TABLE_CONFIGS = {
  secret: process.env.TB_JWT_SECRET_KEY,
  issuer: process.env.TB_JWT_ISSUER,
  accessExpire: '1h',
  refreshExpire: '30d'
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
}
