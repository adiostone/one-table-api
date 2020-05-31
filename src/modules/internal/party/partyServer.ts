import WebSocket from 'ws'
import User from '@/models/User'
import { HttpRequest } from '@/http/HttpHandler'
import { setInterval } from 'timers'
import ms from 'ms'
import PartyRoom, { Chat, Member } from '@/modules/internal/party/PartyRoom'
import State from '@/modules/internal/party/states/State'
import NotInRoom from '@/modules/internal/party/states/NotInRoom'
import InRoom from '@/modules/internal/party/states/InRoom'

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
  }
  title: string
  address: string
  capacity: number
  size: number
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
    pricePerCaptia: number
  }
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
    const body: ReplyGetPartyListBody = Object.values(partyRoomList).map(
      partyRoom => {
        return {
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
        }
      }
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
      .then(() => {
        partyRoomList[partyRoom.id] = partyRoom
        transitionTo(ws, new InRoom())

        ws.emit('sendPartyMessage', replyOperation, replyBody)

        // notify
        partyServer.clients.forEach((partyWS: PartyWS) => {
          partyWS.state.notifyNewParty(partyRoom)
        })
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
        icon: myParty.restaurant.get('icon')
      },
      title: myParty.title,
      address: myParty.address,
      capacity: myParty.capacity,
      size: myParty.size
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
          pricePerCapita: menuInCart.pricePerCapita
        }
        ws.emit('sendPartyMessage', replyOperation, replyBody)

        if (body.isShared) {
          partyRoom.members.forEach(member => {
            member.ws.state.notifyNewSharedMenu(partyRoom, menuInCart)
            member.ws.state.notifyAllMemberNotReady(partyRoom)
          })
        }
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

    partyRoom
      .updateMenuInCart(ws, body.id, body.quantity, body.isShared)
      .then(menuInCart => {
        replyBody.updatedMenu = {
          id: menuInCart.id,
          quantity: menuInCart.quantity,
          isShared: body.isShared,
          pricePerCaptia: menuInCart.pricePerCapita
        }
        ws.emit('sendPartyMessage', replyOperation, replyBody)

        if (body.isShared) {
          partyRoom.members.forEach(member => {
            member.ws.state.notifyUpdateSharedMenu(partyRoom, menuInCart)
            member.ws.state.notifyAllMemberNotReady(partyRoom)
          })
        }
      })
      .catch(() => {
        replyBody.isSuccess = false
        ws.emit('sendPartyMessage', replyOperation, replyBody)
      })
  })
})

partyServer.on('close', () => {
  clearInterval(heartbeat)
})

export default partyServer
