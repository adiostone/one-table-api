import Redis, { Redis as IORedis } from 'ioredis'

export default class RedisConnector {
  private static _instance: RedisConnector

  private _conn: IORedis

  /**
   * Get singleton instance
   *
   * @constructor
   */
  public static get I(): RedisConnector {
    if (this._instance === undefined) {
      this._instance = new this()
    }

    return this._instance
  }

  /**
   * Private constructor for singleton pattern
   */
  // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-empty-function
  private constructor() {}

  public get conn(): IORedis {
    return this._conn
  }

  public async connect(): Promise<void> {
    this._conn = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD
    })

    await this._conn.connect()
  }

  public close(): void {
    this._conn.disconnect()
    this._conn = undefined
  }
}
