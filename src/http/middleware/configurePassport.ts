import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt'
import User from '@/models/User'
import Owner from '@/models/Owner'

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
        const [id, email, image] = [
          profile.id,
          profile.emails[0].value,
          profile.photos[0].value
        ]
        const nickname = email.split('@')[0]

        User.findOrBuild({
          where: { id: id },
          defaults: {
            email: email,
            nickname: nickname,
            image: image
          }
        }).then(result => {
          const [user, built] = result

          // check if new user
          if (built) {
            // sign up
            done(null, user)
          } else {
            user.update({ signedInAt: new Date() }).then(() => {
              // sign in
              done(null, user)
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
            // 401 error
            done(null, false)
          } else {
            // authenticated
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

  // google strategy for restaurant owner
  passport.use(
    'google-restaurant',
    new GoogleStrategy(
      {
        clientID: process.env.RT_GOOGLE_CLIENT_ID,
        clientSecret: process.env.RT_GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.RT_GOOGLE_CALLBACK_URL
      },
      (accessToken, refreshToken, profile, done) => {
        // get owner information from google
        const [id, email, image] = [
          profile.id,
          profile.emails[0].value,
          profile.photos[0].value
        ]
        const nickname = email.split('@')[0]

        Owner.findOrBuild({
          where: { id: id },
          defaults: {
            email: email,
            nickname: nickname,
            image: image
          }
        }).then(result => {
          const [owner, built] = result

          // check if new owner
          if (built) {
            // sign up
            done(null, owner)
          } else {
            owner.update({ signedInAt: new Date() }).then(() => {
              // sign in
              done(null, owner)
            })
          }
        })
      }
    )
  )

  // jwt access token strategy for restaurant owner
  passport.use(
    'jwt-access-restaurant',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.RT_JWT_SECRET_KEY,
        issuer: process.env.RT_JWT_ISSUER
      },
      (payload, done) => {
        const id = payload.sub

        Owner.findByPk(id).then(owner => {
          if (owner === null) {
            // 401 error
            done(null, false)
          } else {
            // authenticated
            done(null, owner)
          }
        })
      }
    )
  )

  // jwt refresh token strategy for restaurant owner
  passport.use(
    'jwt-refresh-restaurant',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.RT_JWT_SECRET_KEY,
        issuer: process.env.RT_JWT_ISSUER
      },
      (payload, done) => {
        done(null, true)
      }
    )
  )
}
