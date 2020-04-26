import { Model, DataTypes } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'
import User from '@/models/User'

const schema = {
  refresh: {
    type: DataTypes.STRING(512),
    primaryKey: true
  },
  userID: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  expireAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}

export default class UserToken extends Model {
  public refresh: string
  public userID: string
  public expireAt: Date

  public static async initModel(): Promise<void> {
    this.init(schema, {
      timestamps: false,
      tableName: 'user_tokens',
      sequelize: MySQLConnector.I.conn
    })

    this.belongsTo(User, {
      foreignKey: 'userID',
      targetKey: 'id',
      onDelete: 'cascade'
    })

    await this.sync()
  }
}
