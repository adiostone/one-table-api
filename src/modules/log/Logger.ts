import winston, { Logger as WinstonLogger } from 'winston'

const { printf, combine, timestamp, colorize } = winston.format

const commonFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

type levelOptions = 'info' | 'error' | 'debug'

export default class Logger {
  /**
   * Singleton instance
   */
  private static _instance: Logger

  /**
   * Actual logger instance
   */
  private readonly logger: WinstonLogger

  /**
   * Get singleton instance.
   */
  public static get I(): Logger {
    if (this._instance === undefined) {
      this._instance = new this()
    }

    return this._instance
  }

  /**
   * Initialize logger.
   */
  private constructor() {
    this.logger = winston.createLogger({
      transports: [
        // transport for out log
        new winston.transports.File({
          level: 'info',
          filename: `${process.env.APP_LOG_DIR}/out.log`,
          handleExceptions: true,
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          format: combine(timestamp(), commonFormat)
        }),
        // transport for error log
        new winston.transports.File({
          level: 'error',
          filename: `${process.env.APP_LOG_DIR}/error.log`,
          handleExceptions: true,
          maxsize: 5242880, // 5MB
          maxFiles: 3,
          format: combine(timestamp(), commonFormat)
        }),
        // transport for console log
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          format: combine(colorize(), timestamp(), commonFormat)
        })
      ],
      exitOnError: false
    })
  }

  public log(level: levelOptions, message: string): void {
    this.logger.log(level, message)
  }
}
