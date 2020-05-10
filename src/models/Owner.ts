import { DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'
import Restaurant from '@/models/Restaurant'

const schema = {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(256),
    allowNull: false,
    unique: true
  },
  nickname: {
    type: DataTypes.STRING(32),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(256),
    allowNull: true
  },
  signedInAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  signedUpAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}

export default class Owner extends Model {
  public id: string
  public email: string
  public nickname: string
  public image: string | null
  public signedInAt: Date
  public signedUpAt: Date

  public static initModel(): void {
    this.init(schema, {
      timestamps: false,
      tableName: 'owners',
      sequelize: MySQLConnector.I.conn
    })
  }

  public static initAssociation(): void {
    this.hasOne(Restaurant, {
      sourceKey: 'id',
      foreignKey: 'ownerID',
      as: 'restaurant',
      onDelete: 'cascade'
    })
  }
}
