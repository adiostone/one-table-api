import { DataTypes, Model } from 'sequelize'

export default class User extends Model {
  public id: string
  public email: string
  public name: string
  public image: string | null

  public readonly createdAt: Date
  public readonly updatedAt: Date
}

export const userSchema = {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(256),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(32),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(256),
    allowNull: true
  }
}
