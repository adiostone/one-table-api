import MySQLConnector from '@/modules/database/MySQLConnector'
import User from '@/models/User'
import UserToken from '@/models/UserToken'
import RedisConnector from '@/modules/database/RedisConnector'
import Owner from '@/models/Owner'
import OwnerToken from '@/models/OwnerToken'
import UserPlace from '@/models/UserPlace'

export default class DBServiceProvider {
  public static async boot(): Promise<void> {
    // connect to redis
    RedisConnector.I.connect()

    // connect to database
    await MySQLConnector.I.connect()

    // initialize models
    User.initModel()
    UserToken.initModel()
    UserPlace.initModel()
    Owner.initModel()
    OwnerToken.initModel()

    // initialize associations
    UserToken.initAssociation()
    UserPlace.initAssociation()
    OwnerToken.initAssociation()

    // sync to database
    await User.sync()
    await UserToken.sync()
    await UserPlace.sync()
    await Owner.sync()
    await OwnerToken.sync()
  }
}
