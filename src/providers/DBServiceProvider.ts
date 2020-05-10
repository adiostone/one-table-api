import MySQLConnector from '@/modules/database/MySQLConnector'
import User from '@/models/User'
import UserToken from '@/models/UserToken'
import RedisConnector from '@/modules/database/RedisConnector'
import Owner from '@/models/Owner'
import OwnerToken from '@/models/OwnerToken'
import UserPlace from '@/models/UserPlace'
import Restaurant from '@/models/Restaurant'
import BusinessHour from '@/models/BusinessHour'
import MenuCategory from '@/models/MenuCategory'
import Menu from '@/models/Menu'
import MenuPrice from '@/models/MenuPrice'

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
    Restaurant.initModel()
    BusinessHour.initModel()
    MenuCategory.initModel()
    Menu.initModel()
    MenuPrice.initModel()

    // initialize associations
    User.initAssociation()
    UserToken.initAssociation()
    OwnerToken.initAssociation()
    Restaurant.initAssociation()
    MenuCategory.initAssociation()
    Menu.initAssociation()

    // sync to database
    await User.sync()
    await UserToken.sync()
    await UserPlace.sync()
    await Owner.sync()
    await OwnerToken.sync()
    await Restaurant.sync()
    await BusinessHour.sync()
    await MenuCategory.sync()
    await Menu.sync()
    await MenuPrice.sync()
  }
}
