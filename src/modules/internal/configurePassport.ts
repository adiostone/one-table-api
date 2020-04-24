import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '@/models/User'

export default function configurePassport(): void {
  // google strategy for table user
  passport.use(
    'google-table',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_TB_CLIENT_ID,
        clientSecret: process.env.GOOGLE_TB_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_TB_CALLBACK_URL
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
            done(null, user, { message: 'Signed in' })
          }
        })
      }
    )
  )
}