import WebSocket from 'ws'
import User from '@/models/User'
import { HttpRequest } from '@/http/HttpHandler'
import { setInterval } from 'timers'
import ms from 'ms'
import PartyRoom, {
  Chat,
  Member,
  MenuInCart
} from '@/modules/internal/party/PartyRoom'
import State from '@/modules/internal/party/states/State'
import NotInRoom from '@/modules/internal/party/states/NotInRoom'
import InRoom from '@/modules/internal/party/states/InRoom'
import orderManagingServer, {
  OrderManagingWS
} from '@/modules/internal/order-managing/orderManagingServer'
import getDistance from '@/modules/internal/getDistance'
import Push from '@/modules/notification/Push'
import { Op } from 'sequelize'

export interface PartyWS extends WebSocket {
  isAlive: boolean
  user: User
  roomID: string | null
  state: State
}

export function transitionTo(ws: PartyWS, state: State): void {
  ws.state = state
  ws.state.ws = ws
}

interface PartyMessage {
  operation: string
  body?: {}
}

interface ErrorBody {
  errorOperation: string
  errorMessage: string
}

interface CreatePartyBody {
  restaurantID: number
  title: string
  address: string
  capacity: number
}

interface ReplyCreatePartyBody {
  isSuccess: boolean
}

type ReplyGetPartyListBody = {
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
}[]

interface JoinPartyBody {
  id: string
}

interface ReplyJoinPartyBody {
  isSuccess: boolean
}

interface ReplyGetMyPartyMetadataBody {
  id: string
  restaurant: {
    id: number
    name: string
    icon: string
    minOrderPrice: number
    deliveryCost: number
    packagingCost: number
    nonF2FCost: number
  }
  title: string
  address: string
  capacity: number
  size: number
  totalPrice: number
}

type ReplyGetMyPartyMemberListBody = {
  id: string
  nickname: string
  image: string
  isHost: boolean
  isReady: boolean
}[]

interface ReplyLeavePartyBody {
  isSuccess: boolean
}

interface KickOutMemberBody {
  id: string
}

interface ReplyKickOutMemberBody {
  isSuccess: boolean
}

interface SendChatBody {
  chat: string
}

interface ReplySendChatBody {
  isSuccess: boolean
}

type ReplyGetMyPartyChats = Chat[]

interface AddToCartBody {
  id: number
  quantity: number
  isShared: boolean
}

interface ReplyAddToCartBody {
  isSuccess: boolean
  addedMenu: null | {
    id: number
    quantity: number
    isShared: boolean
    pricePerCapita: number
    name: string
    image: string
  }
}

interface UpdateMenuInCartBody {
  id: number
  quantity: number
  isShared: boolean
}

interface ReplyUpdateMenuInCartBody {
  isSuccess: boolean
  updatedMenu: null | {
    id: number
    quantity: number
    isShared: boolean
    pricePerCapita: number
    name: string
    image: string
  }
}

interface DeleteMenuInCartBody {
  id: number
  isShared: boolean
}

interface ReplyDeleteMenuInCartBody {
  isSuccess: boolean
  deletedMenu: null | {
    id: number
    isShared: boolean
  }
}

interface SetReadyBody {
  isReady: boolean
}

interface ReplySetReadyBody {
  isSuccess: boolean
}

type ReplyGetSharedCartBody = {
  id: number
  quantity: number
  isShared: boolean
  pricePerCapita: number
  name: string
  image: string
}[]

interface GetReadyPaymentBody {
  isNonF2F: boolean
  nonF2FAddress?: string
  phoneNumber: string
  request?: string
}

interface ReplyGetReadyPaymentBody {
  isSuccess: boolean
  finalTotalPrice: number
}

interface VerifyPaymentBody {
  impUID: string
  merchantUID: string
}

interface ReplyVerifyPaymentBody {
  isSuccess: boolean
  isPaidList: {
    id: string
    isPaid: boolean
  }[]
}

interface ReplyReceiveDeliveryBody {
  isSuccess: boolean
}

const partyServer = new WebSocket.Server({ noServer: true })
export const partyRoomList: { [key: string]: PartyRoom } = {}

// repeatedly check heartbeat of each clients
const heartbeat = setInterval(() => {
  partyServer.clients.forEach((ws: PartyWS) => {
    // broken connection
    if (ws.isAlive === false) {
      ws.emit('close')
    }

    ws.isAlive = false
    ws.emit('ping')
  })
}, ms('30s'))

partyServer.on('connection', (ws: PartyWS, req: HttpRequest) => {
  // initialize connection
  ws.isAlive = true
  ws.user = req.user as User
  ws.roomID = null
  transitionTo(ws, new NotInRoom())

  /* Register events */

  ws.on('ping', () => {
    ws.emit('sendPartyMessage', 'ping')
  })

  ws.on('pong', () => {
    ws.isAlive = true
  })

  /**
   * Receive message and decode it.
   * And then trigger proper event.
   */
  ws.on('message', msg => {
    console.log('incoming msg: ' + msg)

    // decode received message
    const message: PartyMessage = JSON.parse(msg as string)

    // check if the operation is exist
    if (ws.listeners(message.operation).length > 0) {
      // trigger operation
      ws.emit(message.operation, message.body)
    } else {
      // send error message
      ws.emit('sendErrorMessage', message.operation, 'invalid operation')
    }
  })

  /**
   * Send all party message in encoded format.
   */
  ws.on('sendPartyMessage', (operation, body?) => {
    const message: PartyMessage = {
      operation: operation
    }

    if (body !== null) {
      message.body = body
    }

    console.log('send message: ' + JSON.stringify(message))
    ws.send(JSON.stringify(message))
  })

  /**
   * Send error message.
   */
  ws.on('sendErrorMessage', (errorOperation, errorMessage) => {
    const errorBody: ErrorBody = {
      errorOperation: errorOperation,
      errorMessage: errorMessage
    }

    ws.emit('sendPartyMessage', 'error', errorBody)
  })

  /**
   * Close party websocket connection.
   */
  ws.on('close', () => {
    ws.isAlive = false
    ws.close()
  })

  /**
   * Get all near party list.
   */
  ws.on('getPartyList', () => {
    const operation = 'replyGetPartyList'
    const body: ReplyGetPartyListBody = Object.values(partyRoomList).reduce(
      (accumulator, partyRoom) => {
        if (partyRoom.isPaymentPhase === false) {
          accumulator.push({
            id: partyRoom.id,
            restaurant: {
              id: partyRoom.restaurant.get('id'),
              name: partyRoom.restaurant.get('name'),
              icon: partyRoom.restaurant.get('icon')
            },
            title: partyRoom.title,
            address: partyRoom.address,
            capacity: partyRoom.capacity,
            size: partyRoom.size
          })
        }

        return accumulator
      },
      []
    )

    ws.emit('sendPartyMessage', operation, body)
  })

  /**
   * Create new party room.
   */
  ws.on('createParty', (body: CreatePartyBody) => {
    const partyRoom = new PartyRoom()
    const replyOperation = 'replyCreateParty'
    const replyBody: ReplyCreatePartyBody = {
      isSuccess: true
    }

    partyRoom
      .createParty(
        body.restaurantID,
        body.title,
        body.address,
        body.capacity,
        ws
      )
      .then(async () => {
        partyRoomList[partyRoom.id] = partyRoom
        transitionTo(ws, new InRoom())

        ws.emit('sendPartyMessage', replyOperation, replyBody)

        // notify
        partyServer.clients.forEach((partyWS: PartyWS) => {
          partyWS.state.notifyNewParty(partyRoom)
        })

        let host = await ws.user.reload({
          include: [
            {
              association: User.associations.place,
              attributes: ['latitude', 'longitude']
            }
          ],
          plain: true
        })
        host = host.toJSON() as User

        const partyRoomLatitude = host.place.latitude
        const partyRoomLongitude = host.place.longitude

        // send push notifications to near hungry users
        const users = await User.findAll({
          where: { pushToken: { [Op.ne]: null }, isHungry: true },
          include: [
            {
              association: User.associations.place,
              attributes: ['latitude', 'longitude']
            }
          ]
        })

        const push = new Push()
        for (let user of users) {
          user = user.toJSON() as User

          const distanceInKM = getDistance(
            partyRoomLatitude,
            partyRoomLongitude,
            user.place.latitude,
            user.place.longitude
          )

          if (distanceInKM > 0.5) {
            continue
          }

          if (
            Array.from(partyServer.clients).some((ws: PartyWS) => {
              return ws.user.get('id') === user.id
            })
          ) {
            continue
          }

          push.addToMessageQueue({
            to: user.pushToken,
            title: '👋🏻 주변에 새로운 파티가 생겼어요.',
            body: `[${partyRoom.restaurant.get('name')}] ${partyRoom.title}`,
            data: { operation: 'createParty' }
          })
        }

        await push.sendPushMessages()
      })
  })

  ws.on('joinParty', (body: JoinPartyBody) => {
    const partyRoom = partyRoomList[body.id]
    const replyOperation = 'replyJoinParty'
    const replyBody: ReplyJoinPartyBody = {
      isSuccess: true
    }

    let newMember: Member
    try {
      newMember = partyRoom.joinParty(ws)
    } catch (e) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    transitionTo(ws, new InRoom())

    ws.emit('sendPartyMessage', replyOperation, replyBody)

    // notify
    partyServer.clients.forEach((partyWS: PartyWS) => {
      partyWS.state.notifyJoinParty(partyRoom, newMember)
    })

    partyRoom.refreshSharedCart().then(() => {
      partyRoom.members.forEach(member => {
        member.ws.state.notifyRefreshSharedCart(partyRoom, newMember)
      })
    })
  })

  /**
   * Get my party's metadata.
   */
  ws.on('getMyPartyMetadata', () => {
    const myParty = partyRoomList[ws.roomID]

    const operation = 'replyGetMyPartyMetadata'
    const body: ReplyGetMyPartyMetadataBody = {
      id: myParty.id,
      restaurant: {
        id: myParty.restaurant.get('id'),
        name: myParty.restaurant.get('name'),
        icon: myParty.restaurant.get('icon'),
        minOrderPrice: myParty.restaurant.get('minOrderPrice'),
        deliveryCost: myParty.restaurant.get('deliveryCost'),
        packagingCost: myParty.restaurant.get('packagingCost'),
        nonF2FCost: myParty.restaurant.get('nonF2FCost')
      },
      title: myParty.title,
      address: myParty.address,
      capacity: myParty.capacity,
      size: myParty.size,
      totalPrice: myParty.totalPrice
    }

    ws.emit('sendPartyMessage', operation, body)
  })

  ws.on('getMyPartyMemberList', () => {
    const myParty = partyRoomList[ws.roomID]

    const operation = 'replyGetMyPartyMemberList'
    const body: ReplyGetMyPartyMemberListBody = myParty.members.map(member => {
      return {
        id: member.ws.user.get('id'),
        nickname: member.ws.user.get('nickname'),
        image: member.ws.user.get('image'),
        isHost: member.isHost,
        isReady: member.isReady
      }
    })

    ws.emit('sendPartyMessage', operation, body)
  })

  ws.on('leaveParty', () => {
    const myParty = partyRoomList[ws.roomID]
    const replyOperation = 'replyLeaveParty'
    const replyBody: ReplyLeavePartyBody = {
      isSuccess: true
    }

    let outMember: Member
    try {
      outMember = myParty.leaveParty(ws)
    } catch (e) {
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    // if there are no longer members, delete party
    if (myParty.size === 0) {
      delete partyRoomList[myParty.id]
      partyServer.clients.forEach((partyWS: PartyWS) => {
        partyWS.state.notifyDeleteParty(myParty)
      })
    } else {
      partyServer.clients.forEach((partyWS: PartyWS) => {
        partyWS.state.notifyLeaveParty(myParty, outMember)
      })

      myParty.refreshSharedCart().then(() => {
        myParty.members.forEach(member => {
          member.ws.state.notifyRefreshSharedCart(myParty)
        })
      })

      if (outMember.cart.length > 0) {
        myParty.members.forEach(member => {
          member.ws.state.notifyRefreshTotalPrice(myParty)
        })
      }
    }

    transitionTo(ws, new NotInRoom())
    ws.emit('sendPartyMessage', replyOperation, replyBody)
  })

  ws.on('kickOutMember', (body: KickOutMemberBody) => {
    const myParty = partyRoomList[ws.roomID]
    const member = myParty.getMember(ws.user.get('id'))
    const replyOperation = 'replyKickOutMember'
    const replyBody: ReplyKickOutMemberBody = {
      isSuccess: true
    }

    // if not host, cannot kick out other members.
    if (!member.isHost) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    // if member to kick is not exist in the party room
    const memberToKick = myParty.getMember(body.id)
    if (memberToKick === undefined) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    myParty.leaveParty(memberToKick.ws)
    transitionTo(memberToKick.ws, new NotInRoom())
    ws.emit('sendPartyMessage', replyOperation, replyBody)

    partyServer.clients.forEach((partyWS: PartyWS) => {
      partyWS.state.notifyKickedOutMember(myParty, memberToKick)
    })

    myParty.refreshSharedCart().then(() => {
      myParty.members.forEach(member => {
        member.ws.state.notifyRefreshSharedCart(myParty)
      })
    })

    if (memberToKick.cart.length > 0) {
      myParty.members.forEach(member => {
        member.ws.state.notifyRefreshTotalPrice(myParty)
      })
    }
  })

  ws.on('getMyPartyChats', () => {
    const myParty = partyRoomList[ws.roomID]

    const operation = 'replyGetMyPartyChats'
    const body: ReplyGetMyPartyChats = myParty.chats

    ws.emit('sendPartyMessage', operation, body)
  })

  ws.on('sendChat', (body: SendChatBody) => {
    const partyRoom = partyRoomList[ws.roomID]
    const replyOperation = 'replySendChat'
    const replyBody: ReplySendChatBody = {
      isSuccess: true
    }

    try {
      partyRoom.sendChat(ws, body.chat)
    } catch (e) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    ws.emit('sendPartyMessage', replyOperation, replyBody)

    partyRoom.members.forEach(member => {
      member.ws.state.notifyNewChat(partyRoom)
    })
  })

  ws.on('addToCart', (body: AddToCartBody) => {
    const partyRoom = partyRoomList[ws.roomID]
    const replyOperation = 'replyAddToCart'
    const replyBody: ReplyAddToCartBody = {
      isSuccess: true,
      addedMenu: null
    }

    partyRoom
      .addToCart(ws, body.id, body.quantity, body.isShared)
      .then(menuInCart => {
        replyBody.addedMenu = {
          id: menuInCart.id,
          quantity: menuInCart.quantity,
          isShared: body.isShared,
          pricePerCapita: menuInCart.pricePerCapita,
          name: menuInCart.name,
          image: menuInCart.image
        }
        ws.emit('sendPartyMessage', replyOperation, replyBody)

        if (body.isShared) {
          partyRoom.members.forEach(member => {
            member.ws.state.notifyNewSharedMenu(partyRoom, menuInCart)
            member.ws.state.notifyAllMemberNotReady(partyRoom)
          })
        }

        partyRoom.members.forEach(member => {
          member.ws.state.notifyRefreshTotalPrice(partyRoom)
        })
      })
      .catch(() => {
        replyBody.isSuccess = false
        ws.emit('sendPartyMessage', replyOperation, replyBody)
      })
  })

  ws.on('updateMenuInCart', (body: UpdateMenuInCartBody) => {
    const partyRoom = partyRoomList[ws.roomID]
    const replyOperation = 'replyUpdateMenuInCart'
    const replyBody: ReplyUpdateMenuInCartBody = {
      isSuccess: true,
      updatedMenu: null
    }

    let updatedMenuInCart: MenuInCart
    try {
      updatedMenuInCart = partyRoom.updateMenuInCart(
        ws,
        body.id,
        body.quantity,
        body.isShared
      )
    } catch (e) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    replyBody.updatedMenu = {
      id: updatedMenuInCart.id,
      quantity: updatedMenuInCart.quantity,
      isShared: body.isShared,
      pricePerCapita: updatedMenuInCart.pricePerCapita,
      name: updatedMenuInCart.name,
      image: updatedMenuInCart.image
    }
    ws.emit('sendPartyMessage', replyOperation, replyBody)

    if (body.isShared) {
      partyRoom.members.forEach(member => {
        member.ws.state.notifyUpdateSharedMenu(partyRoom, updatedMenuInCart)
        member.ws.state.notifyAllMemberNotReady(partyRoom)
      })
    }

    partyRoom.members.forEach(member => {
      member.ws.state.notifyRefreshTotalPrice(partyRoom)
    })
  })

  ws.on('deleteMenuInCart', (body: DeleteMenuInCartBody) => {
    const partyRoom = partyRoomList[ws.roomID]
    const replyOperation = 'replyDeleteMenuInCart'
    const replyBody: ReplyDeleteMenuInCartBody = {
      isSuccess: true,
      deletedMenu: null
    }

    let deletedMenuInCart: MenuInCart
    try {
      deletedMenuInCart = partyRoom.deleteMenuInCart(ws, body.id, body.isShared)
    } catch (e) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    replyBody.deletedMenu = {
      id: deletedMenuInCart.id,
      isShared: body.isShared
    }
    ws.emit('sendPartyMessage', replyOperation, replyBody)

    if (body.isShared) {
      partyRoom.members.forEach(member => {
        member.ws.state.notifyDeleteSharedMenu(partyRoom, deletedMenuInCart)
        member.ws.state.notifyAllMemberNotReady(partyRoom)
      })
    }

    partyRoom.members.forEach(member => {
      member.ws.state.notifyRefreshTotalPrice(partyRoom)
    })
  })

  ws.on('setReady', (body: SetReadyBody) => {
    const partyRoom = partyRoomList[ws.roomID]
    const replyOperation = 'replySetReady'
    const replyBody: ReplySetReadyBody = {
      isSuccess: true
    }

    let readyMember: Member
    try {
      readyMember = partyRoom.setReady(ws, body.isReady)
    } catch (e) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    ws.emit('sendPartyMessage', replyOperation, replyBody)

    partyRoom.members.forEach(member => {
      member.ws.state.notifyMemberSetReady(partyRoom, readyMember)
    })
  })

  ws.on('getSharedCart', () => {
    const partyRoom = partyRoomList[ws.roomID]
    const replyOperation = 'replyGetSharedCart'
    const replyBody: ReplyGetSharedCartBody = partyRoom.sharedCart.map(
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

    ws.emit('sendPartyMessage', replyOperation, replyBody)
  })

  ws.on('goToPayment', () => {
    const partyRoom = partyRoomList[ws.roomID]

    try {
      partyRoom.goToPayment(ws)
    } catch (e) {
      return
    }

    partyServer.clients.forEach((partyWS: PartyWS) => {
      partyWS.state.notifyDeleteParty(partyRoom)
    })

    partyRoom.members.forEach(member => {
      member.ws.state.notifyGoToPayment(partyRoom)
    })
  })

  ws.on('getReadyPayment', (body: GetReadyPaymentBody) => {
    const partyRoom = partyRoomList[ws.roomID]
    const replyOperation = 'replyGetReadyPayment'
    const replyBody: ReplyGetReadyPaymentBody = {
      isSuccess: true,
      finalTotalPrice: 0
    }

    let finalTotalPrice = 0
    try {
      finalTotalPrice = partyRoom.getReadyPayment(
        ws,
        body.isNonF2F,
        body.nonF2FAddress,
        body.phoneNumber,
        body.request
      )
    } catch (e) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    replyBody.finalTotalPrice = finalTotalPrice
    ws.emit('sendPartyMessage', replyOperation, replyBody)
  })

  ws.on('verifyPayment', (body: VerifyPaymentBody) => {
    const partyRoom = partyRoomList[ws.roomID]
    const currMember = partyRoom.getMember(ws.user.get('id'))
    const replyOperation = 'replyVerifyPayment'
    const replyBody: ReplyVerifyPaymentBody = {
      isSuccess: true,
      isPaidList: []
    }

    partyRoom
      .verifyPayment(ws, body.merchantUID)
      .then(() => {
        replyBody.isPaidList = partyRoom.members.map(member => {
          return {
            id: member.ws.user.get('id'),
            isPaid: member.isPaid
          }
        })
        ws.emit('sendPartyMessage', replyOperation, replyBody)

        partyRoom.members.forEach(member => {
          if (member !== currMember && member.isPaid === true) {
            member.ws.state.notifyCompletePayment(partyRoom, currMember)
          }
        })

        if (partyRoom.members.every(member => member.isPaid)) {
          const orderManagingWS = Array.from(orderManagingServer.clients).find(
            (orderWS: OrderManagingWS) =>
              orderWS.restaurant.get('id') === partyRoom.restaurant.get('id')
          )

          if (orderManagingWS !== undefined) {
            orderManagingWS.emit('notifyNewOrder', partyRoom)
          }
        }
      })
      .catch(() => {
        replyBody.isSuccess = false
        ws.emit('sendPartyMessage', replyOperation, replyBody)
      })
  })

  ws.on('receiveDelivery', () => {
    const partyRoom = partyRoomList[ws.roomID]
    const replyOperation = 'replyReceiveDelivery'
    const replyBody: ReplyReceiveDeliveryBody = {
      isSuccess: true
    }

    let receiveMember: Member
    try {
      receiveMember = partyRoom.receiveDelivery(ws)
    } catch (e) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
    }

    // if there are no longer members, delete party
    if (partyRoom.size === 0) {
      delete partyRoomList[partyRoom.id]
    } else {
      partyRoom.members.forEach(member => {
        member.ws.state.notifyMemberReceiveDelivery(partyRoom, receiveMember)
      })
    }

    transitionTo(ws, new NotInRoom())
    ws.emit('sendPartyMessage', replyOperation, replyBody)
  })
})

partyServer.on('close', () => {
  clearInterval(heartbeat)
})

export default partyServer
