import { nanoid } from 'nanoid'
import Restaurant from '@/models/Restaurant'
import partyServer, { PartyWS } from '@/http/websocket/partyServer'
import User from '@/models/User'

export interface PartyRoom {
  restaurant: Restaurant
  title: string
  address: string
  capacity: number
  host: User
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

  public getPartyList(ws: PartyWS): { [key: string]: PartyRoom } {
    return this.partyList
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
      host: ws.user,
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

  public joinParty(ws: PartyWS, partyID: string): void {
    const party = this.partyList[partyID]

    if (party === undefined) {
      return
    }

    if (party.members.length >= party.capacity) {
      return
    }

    party.members.push(ws)
    ws.joinedParty = partyID

    // to joined member
    ws.emit('notifySuccessJoin', party)

    // to waiting users
    partyServer.clients.forEach((allWS: PartyWS) => {
      if (allWS.joinedParty === null) {
        allWS.emit('notifyChangedPartySize', partyID, party.members.length)
      }
    })

    // to all members in this party
    party.members.forEach(memberWS => {
      if (ws.user.get('id') !== memberWS.user.get('id')) {
        memberWS.emit(
          'notifyNewMember',
          ws.user.get('nickname'),
          party.members.length
        )
      }
    })
  }
}
