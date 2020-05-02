import express from 'express'
import passport from 'passport'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import RestaurantAuthController from '@/http/controller/RestaurantAuthController'

const authRouter = express.Router()

/**
 * GET: redirect to google signin form
 */
authRouter
  .route('/signin')
  .get(
    passport.authenticate('google-restaurant', {
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
    passport.authenticate('google-restaurant', { session: false }),
    RestaurantAuthController.handshake
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

/**
 * GET: refresh access token and if needed refresh the `refresh token`.
 */
authRouter
  .route('/refresh')
  .get(
    passport.authenticate('jwt-refresh-restaurant', { session: false }),
    RestaurantAuthController.refresh
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

/**
 * GET: add owner's access token to blacklist
 */
authRouter
  .route('/signout')
  .get(
    passport.authenticate('jwt-access-restaurant', { session: false }),
    RestaurantAuthController.signOut
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default authRouter
