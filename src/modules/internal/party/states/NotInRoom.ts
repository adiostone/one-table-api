import State from '@/modules/internal/party/states/State'
import PartyRoom from '@/modules/internal/party/PartyRoom'

interface NotifyNewPartyBody {
  id: string
  restaurantID: number
  title: string
  address: string
  capacity: number
  size: number
}

export default class NotInRoom extends State {
  public notifyNewParty(newPartyRoom: PartyRoom): void {
    const operation = 'notifyNewParty'
    const body: NotifyNewPartyBody = {
      id: newPartyRoom.id,
      restaurantID: newPartyRoom.restaurantID,
      title: newPartyRoom.title,
      address: newPartyRoom.address,
      capacity: newPartyRoom.capacity,
      size: newPartyRoom.members.length
    }

    this._ws.emit('sendPartyMessage', operation, body)
  }
}
