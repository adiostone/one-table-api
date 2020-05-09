import { DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'

const schema = {
  restaurantID: {
    type: DataTypes.INTEGER.UNSIGNED
  },
  weekday: {
    type: DataTypes.ENUM('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'),
    allowNull: false
  },
  start: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end: {
    type: DataTypes.TIME,
    allowNull: false
  }
}

export default class BusinessHour extends Model {
  public restaurantID: number
  public weekday: string
  public start: string // HH:MM
  public end: string // HH:MM

  public static initModel(): void {
    this.init(schema, {
      timestamps: false,
      tableName: 'business_hours',
      sequelize: MySQLConnector.I.conn
    })
  }
}
