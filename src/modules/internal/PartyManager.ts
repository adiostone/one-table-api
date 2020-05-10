import { nanoid } from 'nanoid'
import Restaurant from '@/models/Restaurant'
import partyServer, { PartyWS } from '@/http/websocket/partyServer'

export interface PartyRoom {
  restaurant: Restaurant
  title: string
  address: string
  capacity: number
  hostID: string
  members: PartyWS[]
}

export default class PartyManager {
  private static _instance: PartyManager

  private partyList: { [key: string]: PartyRoom }

  /**
   * Get singleton instance
   *
   * @constructor
   */
  public static get I(): PartyManager {
    if (this._instance === undefined) {
      this._instance = new this()
    }

    return this._instance
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.partyList = {}
  }

  public async createParty(
    ws: PartyWS,
    restaurantID: number,
    title: string,
    address: string,
    capacity: number
  ): Promise<void> {
    const restaurant = await Restaurant.findByPk(restaurantID)
    const party: PartyRoom = {
      restaurant: restaurant,
      title: title,
      address: address,
      capacity: capacity,
      hostID: ws.user.get('id'),
      members: [ws]
    }
    const createdPartyID = nanoid(12)

    this.partyList[createdPartyID] = party
    ws.joinedParty = createdPartyID

    partyServer.clients.forEach((ws: PartyWS) => {
      if (ws.joinedParty === null) {
        ws.emit('notifyNewParty', createdPartyID, party)
      }
    })
  }
}
