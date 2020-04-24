import MySQLConnector from '@/modules/database/MySQLConnector'

export default class DBServiceProvider {
  public static async boot(): Promise<void> {
    await MySQLConnector.I.connect()
  }
}
