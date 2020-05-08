import passport from 'passport'
import CheckTokenBlacklist from '@/http/middleware/CheckTokenBlacklist'

const CheckUserSignIn = [
  passport.authenticate('jwt-access-table', { session: false }),
  CheckTokenBlacklist.handler
]

const CheckOwnerSignIn = [
  passport.authenticate('jwt-access-restaurant', { session: false }),
  CheckTokenBlacklist.handler
]

export { CheckUserSignIn, CheckOwnerSignIn }
