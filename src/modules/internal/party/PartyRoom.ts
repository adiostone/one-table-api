import { PartyWS } from '@/modules/internal/party/partyServer'
import { nanoid } from 'nanoid'
import Restaurant from '@/models/Restaurant'

export interface Chat {
  id: string
  nickname: string
  chat: string
}

export interface Member {
  ws: PartyWS
  isHost: boolean
  isReady: boolean
}

export default class PartyRoom {
  public id: string
  public restaurant: Restaurant
  public title: string
  public address: string
  public capacity: number
  public members: Member[]
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
      [{ ws: hostWS, isHost: true, isReady: false }],
      []
    ]

    hostWS.roomID = this.id
  }

  public get size(): number {
    return this.members.length
  }

  public get host(): Member {
    return this.members.find(member => member.isHost)
  }

  public getMember(userID: string): Member | undefined {
    return this.members.find(member => member.ws.user.get('id') === userID)
  }

  public joinParty(ws: PartyWS): Member {
    if (ws.roomID !== null) {
      throw Error('this user is already joined to another party')
    }

    if (this.capacity <= this.size) {
      throw Error('this party room is already full')
    }

    const newMember = {
      ws: ws,
      isHost: false,
      isReady: false
    }
    this.members.push(newMember)
    ws.roomID = this.id

    return newMember
  }

  public leaveParty(ws: PartyWS): Member {
    const memberIndex = this.members.findIndex(member => member.ws === ws)
    if (memberIndex === -1) {
      throw Error('user is not member of this party room')
    }

    const outMember = this.members[memberIndex]
    this.members.splice(memberIndex, 1)
    ws.roomID = null

    // if out member is host, pick new host randomly
    if (outMember.isHost) {
      const newHost = this.members[Math.floor(Math.random() * this.size)]
      newHost.isHost = true
      newHost.isReady = false
    }

    return outMember
  }

  public sendChat(ws: PartyWS, chat: string): void {
    if (this.getMember(ws.user.get('id')) === undefined) {
      throw Error('user is not member of this party room')
    }

    this.chats.push({
      id: ws.user.get('id'),
      nickname: ws.user.get('nickname'),
      chat: chat
    })
  }
}
