import State from '@/modules/internal/party/states/State'
import PartyRoom from '@/modules/internal/party/PartyRoom'

interface NotifyNewPartyBody {
  id: string
  restaurant: {
    id: number
    name: string
    icon: string
  }
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
      restaurant: {
        id: newPartyRoom.restaurant.get('id'),
        name: newPartyRoom.restaurant.get('name'),
        icon: newPartyRoom.restaurant.get('icon')
      },
      title: newPartyRoom.title,
      address: newPartyRoom.address,
      capacity: newPartyRoom.capacity,
      size: newPartyRoom.members.length
    }

    this._ws.emit('sendPartyMessage', operation, body)
  }
}
