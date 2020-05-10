import { DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'

const schema = {
  userID: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  address1: {
    type: DataTypes.STRING(256),
    allowNull: false
  },
  address2: {
    type: DataTypes.STRING(64),
    allowNull: true
  }
}

export default class UserPlace extends Model {
  public userID: number
  public latitude: number
  public longitude: number
  public address1: string
  public address2: string | null

  public static initModel(): void {
    this.init(schema, {
      timestamps: false,
      tableName: 'user_places',
      sequelize: MySQLConnector.I.conn
    })
  }
}
