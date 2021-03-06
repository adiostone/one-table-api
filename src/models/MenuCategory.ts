import { Association, DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'
import Menu from '@/models/Menu'

const schema = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  restaurantID: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  order: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false
  }
}

export default class MenuCategory extends Model {
  public id: number
  public restaurantID: number
  public name: string
  public order: number

  public readonly menus: Menu[]

  public static associations: {
    menus: Association<MenuCategory, Menu>
  }

  public static initModel(): void {
    this.init(schema, {
      indexes: [
        {
          unique: true,
          fields: ['restaurantID', 'name']
        },
        {
          unique: true,
          fields: ['restaurantID', 'order']
        }
      ],
      timestamps: false,
      tableName: 'menu_categories',
      sequelize: MySQLConnector.I.conn
    })
  }

  public static initAssociation(): void {
    this.hasMany(Menu, {
      sourceKey: 'id',
      foreignKey: 'categoryID',
      as: 'menus',
      onDelete: 'restrict'
    })
  }
}
