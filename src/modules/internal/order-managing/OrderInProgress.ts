import PartyRoom from '@/modules/internal/party/PartyRoom'
import { nanoid } from 'nanoid'

export enum OrderStatus {
  WAITING,
  ACCEPTED,
  COMPLETED
}

export default class OrderInProgress {
  public id: string
  public partyRoom: PartyRoom
  public orderedAt: Date
  public status: OrderStatus

  constructor(partyRoom: PartyRoom) {
    this.id = nanoid(11)
    this.partyRoom = partyRoom
    this.orderedAt = new Date()
    this.status = OrderStatus.WAITING
  }
}
