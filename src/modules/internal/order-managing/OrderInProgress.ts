import PartyRoom from '@/modules/internal/party/PartyRoom'
import { nanoid } from 'nanoid'

export default class OrderInProgress {
  public id: string
  public partyRoom: PartyRoom
  public orderedAt: Date

  constructor(partyRoom: PartyRoom) {
    this.id = nanoid(11)
    this.partyRoom = partyRoom
    this.orderedAt = new Date()
  }
}
