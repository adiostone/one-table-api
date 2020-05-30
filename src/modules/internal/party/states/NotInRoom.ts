import State from '@/modules/internal/party/states/State'
import PartyRoom, { Member } from '@/modules/internal/party/PartyRoom'

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

interface NotifyChangedPartySizeBody {
  id: string
  size: number
}

interface NotifyDeletePartyBody {
  id: string
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
      size: newPartyRoom.size
    }

    this._ws.emit('sendPartyMessage', operation, body)
  }

  public notifyJoinParty(partyRoom: PartyRoom, newMember: Member): void {
    const operation = 'notifyChangedPartySize'
    const body: NotifyChangedPartySizeBody = {
      id: partyRoom.id,
      size: partyRoom.size
    }

    this._ws.emit('sendPartyMessage', operation, body)
  }

  public notifyLeaveParty(partyRoom: PartyRoom, outMember: Member): void {
    const operation = 'notifyChangedPartySize'
    const body: NotifyChangedPartySizeBody = {
      id: partyRoom.id,
      size: partyRoom.size
    }

    this._ws.emit('sendPartyMessage', operation, body)
  }

  public notifyDeleteParty(partyRoom: PartyRoom): void {
    const operation = 'notifyDeleteParty'
    const body: NotifyDeletePartyBody = {
      id: partyRoom.id
    }

    this._ws.emit('sendPartyMessage', operation, body)
  }

  public notifyKickedOutMember(partyRoom: PartyRoom, outMember: Member): void {
    const operation = 'notifyChangedPartySize'
    const body: NotifyChangedPartySizeBody = {
      id: partyRoom.id,
      size: partyRoom.size
    }

    this._ws.emit('sendPartyMessage', operation, body)
  }

  public notifyNewChat(partyRoom: PartyRoom): void {
    // do nothing
  }
}
