import { DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'

const schema = {
  menuID: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  quantity: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  price: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    allowNull: false
  }
}

export default class MenuPrice extends Model {
  public menuID: number
  public quantity: string | null
  public price: number

  public static initModel(): void {
    this.init(schema, {
      indexes: [
        {
          unique: true,
          fields: ['menuID', 'quantity']
        }
      ],
      timestamps: false,
      tableName: 'menu_prices',
      sequelize: MySQLConnector.I.conn
    })
  }
}
