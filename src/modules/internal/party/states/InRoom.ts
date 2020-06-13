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

interface NotifyMemberSetReadyBody {
  id: string
  isReady: boolean
}

type NotifyRefreshSharedCartBody = {
  id: number
  quantity: number
  isShared: boolean
  pricePerCapita: number
  name: string
  image: string
}[]

interface NotifyRefreshTotalPrice {
  totalPrice: number
}

interface NotifyGoToPaymentBody {
  menus: {
    id: number
    quantity: number
    isShared: boolean
    pricePerCapita: number
    name: string
    packagingCost: number
  }[]
  deliveryCostPerCapita: number
  totalPrice: number
}

interface NotifyOrderIsAccepted {
  estimatedTime: number
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
    if (this._ws.roomID === partyRoom.id && this._ws !== partyRoom.host.ws) {
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
    if (this._ws.roomID === partyRoom.id && this._ws !== partyRoom.host.ws) {
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
    if (this._ws.roomID === partyRoom.id && this._ws !== partyRoom.host.ws) {
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

  public notifyMemberSetReady(partyRoom: PartyRoom, member: Member): void {
    if (this._ws.roomID === partyRoom.id && this._ws !== member.ws) {
      const operation = 'notifyMemberReady'
      const body: NotifyMemberSetReadyBody = {
        id: member.ws.user.get('id'),
        isReady: member.isReady
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyRefreshSharedCart(
    partyRoom: PartyRoom,
    exceptMember?: Member
  ): void {
    if (this._ws.roomID === partyRoom.id) {
      if (exceptMember !== undefined && this._ws === exceptMember.ws) {
        return
      }

      const operation = 'notifyRefreshSharedCart'
      const body: NotifyRefreshSharedCartBody = partyRoom.sharedCart.map(
        menuInCart => {
          return {
            id: menuInCart.id,
            quantity: menuInCart.quantity,
            isShared: true,
            pricePerCapita: menuInCart.pricePerCapita,
            name: menuInCart.name,
            image: menuInCart.image
          }
        }
      )

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyRefreshTotalPrice(partyRoom: PartyRoom): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyRefreshTotalPrice'
      const body: NotifyRefreshTotalPrice = {
        totalPrice: partyRoom.totalPrice
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyGoToPayment(partyRoom: PartyRoom): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyGoToPayment'
      const body: NotifyGoToPaymentBody = {
        menus: [],
        deliveryCostPerCapita: Math.floor(
          partyRoom.restaurant.get('deliveryCost') / partyRoom.size
        ),
        totalPrice: 0
      }

      // shared menu
      for (const sharedMenu of partyRoom.sharedCart) {
        body.menus.push({
          id: sharedMenu.id,
          quantity: sharedMenu.quantity,
          isShared: true,
          pricePerCapita: sharedMenu.pricePerCapita,
          name: sharedMenu.name,
          packagingCost: partyRoom.restaurant.get('packagingCost')
        })
      }

      const currMember = partyRoom.members.find(
        member => member.ws === this._ws
      )

      for (const privateMenu of currMember.cart) {
        body.menus.push({
          id: privateMenu.id,
          quantity: privateMenu.quantity,
          isShared: false,
          pricePerCapita: privateMenu.pricePerCapita,
          name: privateMenu.name,
          packagingCost: 0
        })
      }

      body.totalPrice = currMember.finalTotalPrice

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyOrderIsAccepted(
    partyRoom: PartyRoom,
    estimatedTime: number
  ): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyOrderIsAccepted'
      const body: NotifyOrderIsAccepted = {
        estimatedTime: estimatedTime
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyOrderIsRefused(partyRoom: PartyRoom): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyOrderIsRefused'

      this._ws.emit('sendPartyMessage', operation)
    }
  }

  public notifyStartDelivery(partyRoom: PartyRoom): void {
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyStartDelivery'

      this._ws.emit('sendPartyMessage', operation)
    }
  }
}
