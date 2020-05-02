import { Model, DataTypes } from 'sequelize'
import MySQLConnector from '@/modules/database/MySQLConnector'
import Owner from '@/models/Owner'

const schema = {
  refresh: {
    type: DataTypes.STRING(512),
    primaryKey: true
  },
  ownerID: {
    type: DataTypes.STRING(64),
    allowNull: false
  }
}

export default class OwnerToken extends Model {
  public refresh: string
  public ownerID: string

  public static initModel(): void {
    this.init(schema, {
      timestamps: false,
      tableName: 'owner_tokens',
      sequelize: MySQLConnector.I.conn
    })
  }

  public static initAssociation(): void {
    this.belongsTo(Owner, {
      foreignKey: 'ownerID',
      targetKey: 'id',
      onDelete: 'cascade'
    })
  }
}
