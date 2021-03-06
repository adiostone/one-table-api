import State from '@/modules/internal/party/states/State'
import PartyRoom, {
  Member,
  MenuInCart
} from '@/modules/internal/party/PartyRoom'

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

interface NotifyKickedOutMemberBody {
  size: number
  user: {
    id: string
  }
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
    let operation, body

    // if the kicked out member
    if (this._ws === outMember.ws) {
      operation = 'notifyKickedOutMember'
      body = {
        size: partyRoom.size,
        user: {
          id: outMember.ws.user.get('id')
        }
      } as NotifyKickedOutMemberBody
    } else {
      operation = 'notifyChangedPartySize'
      body = {
        id: partyRoom.id,
        size: partyRoom.size
      } as NotifyChangedPartySizeBody
    }

    this._ws.emit('sendPartyMessage', operation, body)
  }

  public notifyNewChat(partyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyNewSharedMenu(
    partyRoom: PartyRoom,
    menuInCart: MenuInCart
  ): void {
    // do nothing
  }

  public notifyUpdateSharedMenu(
    partyRoom: PartyRoom,
    menuInCart: MenuInCart
  ): void {
    // do nothing
  }

  public notifyDeleteSharedMenu(partyRoom: PartyRoom, menuInCart: MenuInCart) {
    // do nothing
  }

  public notifyAllMemberNotReady(partyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyMemberSetReady(partyRoom: PartyRoom, member: Member): void {
    // do nothing
  }

  public notifyRefreshSharedCart(
    partyRoom: PartyRoom,
    exceptMember?: Member
  ): void {
    // do nothing
  }

  public notifyRefreshTotalPrice(partyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyGoToPayment(partyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyOrderIsAccepted(
    partyRoom: PartyRoom,
    estimatedTime: number
  ): void {
    // do nothing
  }

  public notifyOrderIsRefused(partyRoom: PartyRoom): void {
    if (partyRoom.members.some(member => member.ws === this._ws)) {
      const operation = 'notifyOrderIsRefused'

      this._ws.emit('sendPartyMessage', operation)
    }
  }

  public notifyStartDelivery(partyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyCompletePayment(
    partyRoom: PartyRoom,
    completeMember: Member
  ): void {
    // do nothing
  }

  public notifyMemberReceiveDelivery(
    partyRoom: PartyRoom,
    receiveMember: Member
  ): void {
    // do nothing
  }
}
