import MySQLConnector from '@/modules/database/MySQLConnector'
import User from '@/models/User'
import UserToken from '@/models/UserToken'
import RedisConnector from '@/modules/database/RedisConnector'

export default class DBServiceProvider {
  public static async boot(): Promise<void> {
    // connect to redis
    RedisConnector.I.connect()
    // connect to database
    await MySQLConnector.I.connect()

    // initialize models
    User.initModel()
    UserToken.initModel()

    // initialize associations
    UserToken.initAssociation()

    // sync to database
    await User.sync()
    await UserToken.sync()
  }
}
