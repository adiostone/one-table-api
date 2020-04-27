import express from 'express'
import passport from 'passport'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import TableAuthController from '@/http/controller/TableAuthController'

const authRouter = express.Router()

/**
 * GET: redirect to google signin form
 */
authRouter
  .route('/signin')
  .get(
    passport.authenticate('google-table', {
      session: false,
      scope: ['profile', 'email']
    })
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

/**
 * GET: receive callback from google login form and
 * redirect to handshake url with new issued tokens
 */
authRouter
  .route('/callback')
  .get(
    passport.authenticate('google-table', { session: false }),
    TableAuthController.handshake
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

/**
 * GET: refresh access token and if needed refresh the `refresh token`.
 */
authRouter
  .route('/refresh')
  .get(
    passport.authenticate('jwt-refresh-table', { session: false }),
    TableAuthController.refresh
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

/**
 * GET: add user's access token to blacklist
 */
authRouter
  .route('/signout')
  .get(
    passport.authenticate('jwt-access-table', { session: false }),
    TableAuthController.signOut
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default authRouter
