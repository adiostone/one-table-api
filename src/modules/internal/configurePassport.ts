import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt'
import User from '@/models/User'

export default function configurePassport(): void {
  // google strategy for table user
  passport.use(
    'google-table',
    new GoogleStrategy(
      {
        clientID: process.env.TB_GOOGLE_CLIENT_ID,
        clientSecret: process.env.TB_GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.TB_GOOGLE_CALLBACK_URL
      },
      (accessToken, refreshToken, profile, done) => {
        // get user information from google
        const [id, email, name, image] = [
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          profile.photos[0].value
        ]

        User.findOrBuild({
          where: { id: id },
          defaults: {
            email: email,
            name: name,
            image: image
          }
        }).then(result => {
          const [user, built] = result

          // check if new user
          if (built) {
            done(null, user, { message: 'Signed up' })
          } else {
            user.update({ signedInAt: new Date() }).then(() => {
              done(null, user, { message: 'Signed in' })
            })
          }
        })
      }
    )
  )

  // jwt access token strategy for table user
  passport.use(
    'jwt-access-table',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.TB_JWT_SECRET_KEY,
        issuer: process.env.TB_JWT_ISSUER
      },
      (payload, done) => {
        const id = payload.sub

        User.findByPk(id).then(user => {
          if (user === null) {
            done('Invalid access token')
          } else {
            done(null, user)
          }
        })
      }
    )
  )

  // jwt refresh token strategy for table user
  passport.use(
    'jwt-refresh-table',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.TB_JWT_SECRET_KEY,
        issuer: process.env.TB_JWT_ISSUER
      },
      (payload, done) => {
        done(null, true)
      }
    )
  )
}
