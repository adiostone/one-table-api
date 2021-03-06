import { Association, DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'
import BusinessHour from '@/models/BusinessHour'
import MenuCategory from '@/models/MenuCategory'
import Owner from '@/models/Owner'

const schema = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  ownerID: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  introduction: {
    type: DataTypes.STRING(512),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(256),
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('치킨', '피자', '분식'),
    allowNull: false
  },
  minOrderPrice: {
    type: DataTypes.MEDIUMINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  deliveryCost: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  packagingCost: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  nonF2FCost: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
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
  },
  isPaused: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  holiday: {
    type: DataTypes.STRING(32),
    defaultValue: '연중무휴',
    allowNull: false
  },
  registeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}

export default class Restaurant extends Model {
  public id: number
  public ownerID: string
  public name: string
  public introduction: string
  public icon: string | null
  public category: string
  public minOrderPrice: number
  public deliveryCost: number
  public packagingCost: number
  public nonF2FCost: number
  public phoneNumber: string
  public latitude: number
  public longitude: number
  public address1: string
  public address2: string | null
  public isPaused: boolean
  public holiday: string
  public registeredAt: Date

  public readonly businessHours: BusinessHour[]
  public readonly menuCategories: MenuCategory[]

  public static associations: {
    businessHours: Association<Restaurant, BusinessHour>
    menuCategories: Association<Restaurant, MenuCategory>
  }

  public static initModel(): void {
    this.init(schema, {
      timestamps: false,
      tableName: 'restaurants',
      sequelize: MySQLConnector.I.conn
    })
  }

  public static initAssociation(): void {
    this.belongsTo(Owner, {
      foreignKey: 'ownerID',
      targetKey: 'id',
      onDelete: 'cascade'
    })

    this.hasMany(BusinessHour, {
      sourceKey: 'id',
      foreignKey: 'restaurantID',
      as: 'businessHours',
      onDelete: 'cascade'
    })

    this.hasMany(MenuCategory, {
      sourceKey: 'id',
      foreignKey: 'restaurantID',
      as: 'menuCategories',
      onDelete: 'cascade'
    })
  }
}
