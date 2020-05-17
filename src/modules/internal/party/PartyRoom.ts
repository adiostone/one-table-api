import { PartyWS } from '@/modules/internal/party/partyServer'
import { nanoid } from 'nanoid'
import Restaurant from '@/models/Restaurant'

export default class PartyRoom {
  public id: string
  public restaurant: Restaurant
  public title: string
  public address: string
  public capacity: number
  public members: PartyWS[]

  public async createParty(
    restaurantID: number,
    title: string,
    address: string,
    capacity: number,
    hostWS: PartyWS
  ): Promise<void> {
    ;[
      this.id,
      this.restaurant,
      this.title,
      this.address,
      this.capacity,
      this.members
    ] = [
      nanoid(12),
      await Restaurant.findByPk(restaurantID),
      title,
      address,
      capacity,
      [hostWS]
    ]

    hostWS.roomID = this.id
  }
}
