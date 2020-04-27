import { Sequelize } from 'sequelize'

export default class MySQLConnector {
  private static _instance: MySQLConnector

  private _conn: Sequelize

  /**
   * Get singleton instance
   *
   * @constructor
   */
  public static get I(): MySQLConnector {
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

  public get conn(): Sequelize {
    return this._conn
  }

  public async connect(): Promise<void> {
    this._conn = new Sequelize({
      dialect: 'mysql',
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10)
    })

    await this.healthcheck()
  }

  public async close(): Promise<void> {
    await this._conn.close()
    this._conn = undefined
  }

  public async healthcheck(): Promise<void> {
    await this._conn.authenticate()
  }
}
