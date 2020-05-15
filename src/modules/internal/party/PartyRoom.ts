import { PartyWS } from '@/modules/internal/party/partyServer'
import { nanoid } from 'nanoid'

export default class PartyRoom {
  public id: string
  public restaurantID: number
  public title: string
  public address: string
  public capacity: number
  public members: PartyWS[]

  public constructor(
    restaurantID: number,
    title: string,
    address: string,
    capacity: number,
    hostWS: PartyWS
  ) {
    ;[
      this.id,
      this.restaurantID,
      this.title,
      this.address,
      this.capacity,
      this.members
    ] = [nanoid(12), restaurantID, title, address, capacity, [hostWS]]

    hostWS.roomID = this.id
  }
}
