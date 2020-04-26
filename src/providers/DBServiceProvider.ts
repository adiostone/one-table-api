import MySQLConnector from '@/modules/database/MySQLConnector'
import User from '@/models/User'
import UserToken from '@/models/UserToken'

export default class DBServiceProvider {
  public static async boot(): Promise<void> {
    // connect to database
    await MySQLConnector.I.connect()

    /* create tables */
    await User.initModel()
    await UserToken.initModel()
  }
}
