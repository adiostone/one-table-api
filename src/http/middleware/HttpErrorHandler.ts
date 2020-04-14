import { ErrorHandler, SimpleHandler } from '@/http/HttpHandler'
import Logger from '@/modules/log/Logger'

export default class HttpErrorHandler {
  /**
   * Handle the http not found error.
   *
   * @param req
   * @param res
   */
  public static notFoundHandler: SimpleHandler = (req, res) => {
    res.status(404).json({
      err: {
        msg: 'request not found'
      }
    })
  }

  /**
   * Handle the http method not allowed error.
   *
   * @param req
   * @param res
   */
  public static methodNotAllowedHandler: SimpleHandler = (req, res) => {
    res.status(405).json({
      err: {
        msg: 'method not allowed'
      }
    })
  }

  /**
   * Handle the http syntax error.
   *
   * @param err
   * @param req
   * @param res
   * @param next
   */
  public static syntaxErrorHandler: ErrorHandler = (err, req, res, next) => {
    // if syntax error
    if (err instanceof SyntaxError) {
      res.status(400).json({
        err: {
          msg: `request syntax error: ${err.message}`
        }
      })

      return
    }

    next()
  }

  /**
   * Handle the http internal server error.
   * This is final error handler.
   *
   * @param err
   * @param req
   * @param res
   * @param next
   */
  public static internalServerErrorHandler: ErrorHandler = (
    err,
    req,
    res,
    next
  ) => {
    Logger.I.log('error', err.stack)

    res.status(500).json({
      err: {
        msg: `internal server error: ${err.message}`
      }
    })
  }
}
