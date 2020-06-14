import { Association, DataTypes, Model } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'
import UserPlace from '@/models/UserPlace'

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
  pushToken: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  isHungry: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
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

export default class User extends Model {
  public id: string
  public email: string
  public nickname: string
  public image: string | null
  public pushToken: string | null
  public isHungry: boolean
  public signedInAt: Date
  public signedUpAt: Date

  public readonly place: UserPlace

  public static associations: {
    place: Association<User, UserPlace>
  }

  public static initModel(): void {
    this.init(schema, {
      timestamps: false,
      tableName: 'users',
      sequelize: MySQLConnector.I.conn
    })
  }

  public static initAssociation(): void {
    this.hasOne(UserPlace, {
      sourceKey: 'id',
      foreignKey: 'userID',
      as: 'place',
      onDelete: 'cascade'
    })
  }
}
