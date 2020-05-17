import WebSocket from 'ws'
import User from '@/models/User'
import { HttpRequest } from '@/http/HttpHandler'
import { setInterval } from 'timers'
import ms from 'ms'
import PartyRoom from '@/modules/internal/party/PartyRoom'
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
}[]

interface ReplyLeavePartyBody {
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

  ws.on('sendErrorMessage', (errorOperation, errorMessage) => {
    const errorBody: ErrorBody = {
      errorOperation: errorOperation,
      errorMessage: errorMessage
    }

    ws.emit('sendPartyMessage', 'error', errorBody)
  })

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
          size: partyRoom.members.length
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

    try {
      partyRoom.joinParty(ws)
    } catch (e) {
      replyBody.isSuccess = false
      ws.emit('sendPartyMessage', replyOperation, replyBody)
      return
    }

    transitionTo(ws, new InRoom())

    ws.emit('sendPartyMessage', replyOperation, replyBody)

    // notify
    partyServer.clients.forEach((partyWS: PartyWS) => {
      partyWS.state.notifyJoinParty(partyRoom, ws.user)
    })
  })

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
      size: myParty.members.length
    }

    ws.emit('sendPartyMessage', operation, body)
  })

  ws.on('getMyPartyMemberList', () => {
    const myParty = partyRoomList[ws.roomID]

    const operation = 'replyGetMyPartyMemberList'
    const body: ReplyGetMyPartyMemberListBody = myParty.members.map(
      memberWS => {
        return {
          id: memberWS.user.get('id'),
          nickname: memberWS.user.get('nickname'),
          image: memberWS.user.get('image'),
          isHost: false
        }
      }
    )
    body[0].isHost = true

    ws.emit('sendPartyMessage', operation, body)
  })

  ws.on('leaveParty', () => {
    const myParty = partyRoomList[ws.roomID]
    const hostID = myParty.members[0].user.get('id')
    const replyOperation = 'replyLeaveParty'
    const replyBody: ReplyLeavePartyBody = {
      isSuccess: true
    }

    // if host, delete party
    if (ws.user.get('id') === hostID) {
      // first notify to not in room users
      delete partyRoomList[ws.roomID]
      partyServer.clients.forEach((partyWS: PartyWS) => {
        partyWS.state.notifyDeleteParty(myParty)
      })

      // second notify to all members except host
      for (let i = 1; i < myParty.members.length; i++) {
        const currWS = myParty.members[1]
        myParty.leaveParty(currWS)
        transitionTo(currWS, new NotInRoom())
        currWS.emit('sendPartyMessage', 'notifyKickedOutParty')
      }

      // finally notify to the host
      myParty.leaveParty(ws)
      transitionTo(ws, new NotInRoom())
      ws.emit('sendPartyMessage', replyOperation, replyBody)
    } else {
      myParty.leaveParty(ws)
      transitionTo(ws, new NotInRoom())

      ws.emit('sendPartyMessage', replyOperation, replyBody)

      partyServer.clients.forEach((partyWS: PartyWS) => {
        partyWS.state.notifyLeaveParty(myParty, ws.user)
      })
    }
  })
})

partyServer.on('close', () => {
  clearInterval(heartbeat)
})

export default partyServer
