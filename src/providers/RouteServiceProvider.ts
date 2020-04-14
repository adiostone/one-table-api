import express, { Express } from 'express'
import v1Router from '@/routes/v1/api'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import HttpErrorHandler from '@/http/middleware/HttpErrorHandler'
import morgan from 'morgan'
import fs from 'fs'

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
    })
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
    app.use('/v1', v1Router) // api versioning
    app.use(this.errorMiddleware)

    return app
  }
}
