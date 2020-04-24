import MySQLConnector from '@/modules/database/MySQLConnector'
import User, { userSchema } from '@/models/User'

export default class DBServiceProvider {
  public static async boot(): Promise<void> {
    // connect to database
    await MySQLConnector.I.connect()

    /* create tables */

    User.init(userSchema, {
      tableName: 'users',
      sequelize: MySQLConnector.I.conn
    })

    await User.sync()
  }
}
