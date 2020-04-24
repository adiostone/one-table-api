import express from 'express'
import passport from 'passport'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import TableAuthController from '@/http/controller/TableAuthController'

const tableAuthRouter = express.Router()

/**
 * GET: redirect to google login form
 */
tableAuthRouter
  .route('/login')
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
tableAuthRouter
  .route('/callback')
  .get(
    passport.authenticate('google-table', { session: false }),
    TableAuthController.handshake
  )
  .all(HttpErrorHandler.methodNotAllowedHandler)

export default tableAuthRouter
