import { PartyWS } from '@/modules/internal/party/partyServer'
import { nanoid } from 'nanoid'
import Restaurant from '@/models/Restaurant'

export interface Chat {
  id: string
  nickname: string
  chat: string
}

export default class PartyRoom {
  public id: string
  public restaurant: Restaurant
  public title: string
  public address: string
  public capacity: number
  public members: PartyWS[]
  public chats: Chat[]

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
      this.members,
      this.chats
    ] = [
      nanoid(12),
      await Restaurant.findByPk(restaurantID),
      title,
      address,
      capacity,
      [hostWS],
      []
    ]

    hostWS.roomID = this.id
  }

  public get size(): number {
    return this.members.length
  }

  public get host(): PartyWS {
    return this.members[0]
  }

  public getMember(userID: string): PartyWS {
    return this.members.find(member => member.user.get('id') === userID)
  }

  public joinParty(ws: PartyWS): void {
    if (ws.roomID !== null) {
      throw Error('this user is already joined to another party')
    }

    if (this.capacity <= this.size) {
      throw Error('this party room is already full')
    }

    this.members.push(ws)
    ws.roomID = this.id
  }

  public leaveParty(ws: PartyWS): void {
    const wsIndex = this.members.indexOf(ws)

    if (wsIndex >= 0) {
      this.members.splice(wsIndex, 1)
      ws.roomID = null
    }
  }

  public sendChat(ws: PartyWS, chat: string): void {
    this.chats.push({
      id: ws.user.get('id'),
      nickname: ws.user.get('nickname'),
      chat: chat
    })
  }
}
