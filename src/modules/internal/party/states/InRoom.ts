import State from '@/modules/internal/party/states/State'
import PartyRoom, {
  Chat,
  Member,
  MenuInCart
} from '@/modules/internal/party/PartyRoom'

interface NotifyNewMemberBody {
  size: number
  user: {
    id: string
    nickname: string
    image: string
    isHost: boolean
    isReady: boolean
  }
}

interface NotifyOutMemberBody {
  size: number
  user: {
    id: string
  }
  newHost?: {
    id: string
  }
}

interface NotifyKickedOutMemberBody {
  size: number
  user: {
    id: string
  }
}

type NotifyNewChatBody = Chat

interface NotifyNewSharedMenuBody {
  id: number
  quantity: number
  isShared: boolean
  pricePerCapita: number
  name: string
  image: string
}

interface NotifyUpdateSharedMenuBody {
  id: number
  quantity: number
  isShared: boolean
  pricePerCapita: number
  name: string
  image: string
}

interface NotifyDeleteSharedMenuBody {
  id: number
  isShared: boolean
}

interface NotifyMemberReadyBody {
  id: string
}

export default class InRoom extends State {
  public notifyNewParty(newPartyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyJoinParty(partyRoom: PartyRoom, newMember: Member): void {
    // only notify to members in same party except new member
    if (this._ws.roomID === partyRoom.id && this._ws !== newMember.ws) {
      const operation = 'notifyNewMember'
      const body: NotifyNewMemberBody = {
        size: partyRoom.size,
        user: {
          id: newMember.ws.user.get('id'),
          nickname: newMember.ws.user.get('nickname'),
          image: newMember.ws.user.get('image'),
          isHost: newMember.isHost,
          isReady: newMember.isReady
        }
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyLeaveParty(partyRoom: PartyRoom, outMember: Member): void {
    // only notify to members in same party
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyOutMember'
      const body: NotifyOutMemberBody = {
        size: partyRoom.size,
        user: {
          id: outMember.ws.user.get('id')
        }
      }

      // check if out member is old host,
      // additionally notice the new host
      if (outMember.isHost) {
        body.newHost = {
          id: partyRoom.host.ws.user.get('id')
        }
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyDeleteParty(partyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyKickedOutMember(partyRoom: PartyRoom, outMember: Member): void {
    // only notify to members in same party
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyKickedOutMember'
      const body: NotifyKickedOutMemberBody = {
        size: partyRoom.size,
        user: {
          id: outMember.ws.user.get('id')
        }
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyNewChat(partyRoom: PartyRoom): void {
    // only notify to members in same party
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyNewChat'
      const body: NotifyNewChatBody = partyRoom.chats.slice(-1)[0]

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyNewSharedMenu(
    partyRoom: PartyRoom,
    menuInCart: MenuInCart
  ): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyNewSharedMenu'
      const body: NotifyNewSharedMenuBody = {
        id: menuInCart.id,
        quantity: menuInCart.quantity,
        isShared: true,
        pricePerCapita: menuInCart.pricePerCapita,
        name: menuInCart.name,
        image: menuInCart.image
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyUpdateSharedMenu(
    partyRoom: PartyRoom,
    menuInCart: MenuInCart
  ): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyUpdateSharedMenu'
      const body: NotifyUpdateSharedMenuBody = {
        id: menuInCart.id,
        quantity: menuInCart.quantity,
        isShared: true,
        pricePerCapita: menuInCart.pricePerCapita,
        name: menuInCart.name,
        image: menuInCart.image
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyDeleteSharedMenu(partyRoom: PartyRoom, menuInCart: MenuInCart) {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyDeleteSharedMenu'
      const body: NotifyDeleteSharedMenuBody = {
        id: menuInCart.id,
        isShared: true
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyAllMemberNotReady(partyRoom: PartyRoom): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyAllMemberNotReady'

      this._ws.emit('sendPartyMessage', operation)
    }
  }

  public notifyMemberReady(partyRoom: PartyRoom, member: Member): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyMemberReady'
      const body: NotifyMemberReadyBody = {
        id: member.ws.user.get('id')
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }
}
