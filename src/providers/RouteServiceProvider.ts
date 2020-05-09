import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import morgan from 'morgan'
import fs from 'fs'
import passport from 'passport'
import configurePassport from '@/http/middleware/configurePassport'
import mainRouter from '@/routes'

export default class RouteServiceProvider {
  /**
   * Basic middleware list which is globally applied to router.
   * You can add your own basic middleware to here or remove unused things.
   */
  private static basicMiddleware = [
    cors(), // you should your own cors options (see https://github.com/expressjs/cors)
    helmet(),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    morgan('[:date[iso]] :remote-addr ":method :url" :status ":user-agent"', {
      stream: fs.createWriteStream(`${process.env.APP_LOG_DIR}/access.log`, {
        flags: 'a'
      })
    }),
    passport.initialize()
  ]

  /**
   * Error handler middleware list which handle http errors.
   * You can add your own error middleware to here or remove unused things.
   */
  private static errorMiddleware = [
    HttpErrorHandler.notFoundHandler,
    HttpErrorHandler.syntaxErrorHandler,
    HttpErrorHandler.internalServerErrorHandler
  ]

  /**
   * Boot main router.
   *
   * If you running this app behind a proxy, use trust proxy option.
   * (see http://expressjs.com/en/guide/behind-proxies.html#express-behind-proxies)
   */
  public static boot(): Express {
    const app = express()
    app.set('trust proxy', true)
    app.use(this.basicMiddleware)
    app.use(mainRouter)
    app.use(this.errorMiddleware)

    // configure passport strategies
    configurePassport()

    return app
  }
}
