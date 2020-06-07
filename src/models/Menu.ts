import { Association, DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'
import MenuPrice from '@/models/MenuPrice'

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
  },
  image: {
    type: DataTypes.STRING(256),
    allowNull: true
  },
  isSharing: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}

export default class Menu extends Model {
  public id: number
  public categoryID: number
  public name: string
  public image: string | null
  public isSharing: boolean

  public readonly prices: MenuPrice[]

  public static associations: {
    prices: Association<Menu, MenuPrice>
  }

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

  public static initAssociation(): void {
    this.hasMany(MenuPrice, {
      sourceKey: 'id',
      foreignKey: 'menuID',
      as: 'prices',
      onDelete: 'cascade'
    })
  }
}
