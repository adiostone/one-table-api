import { DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'

const schema = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  categoryID: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false
  }
}

export default class Menu extends Model {
  public id: string
  public categoryID: number
  public name: string

  public static initModel(): void {
    this.init(schema, {
      indexes: [
        {
          unique: true,
          fields: ['categoryID', 'name']
        }
      ],
      timestamps: false,
      tableName: 'meuns',
      sequelize: MySQLConnector.I.conn
    })
  }
}
