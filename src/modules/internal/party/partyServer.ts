import WebSocket from 'ws'
import User from '@/models/User'
import { HttpRequest } from '@/http/HttpHandler'
import { setInterval } from 'timers'
import ms from 'ms'
import PartyRoom from '@/modules/internal/party/PartyRoom'
import State from '@/modules/internal/party/states/State'
import NotInRoom from '@/modules/internal/party/states/NotInRoom'
import InRoom from '@/modules/internal/party/states/InRoom'

export class PartyWS extends WebSocket {
  public isAlive: boolean
  public user: User
  public roomID: string | null
  public state: State

  public transitionTo(state: State): void {
    this.state = state
    this.state.ws = this
  }
}

interface PartyMessage {
  operation: string
  body?: {}
}

interface CreatePartyBody {
  restaurantID: number
  title: string
  address: string
  capacity: number
}

const partyServer = new WebSocket.Server({ noServer: true })
export const partyRoomList: { [key: string]: PartyRoom } = {}

// repeatedly check heartbeat of each clients
const heartbeat = setInterval(() => {
  partyServer.clients.forEach((ws: PartyWS) => {
    // broken connection
    if (ws.isAlive === false) {
      ws.terminate()
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
  ws.transitionTo(new NotInRoom())

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
    // decode received message
    const message: PartyMessage = JSON.parse(msg as string)

    // check if the operation is exist
    if (ws.listeners(message.operation).length > 0) {
      // trigger operation
      ws.emit(message.operation, message.body)
    } else {
      // send error message
      ws.emit('sendPartyMessage', 'error', 'invalid operation')
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

    ws.send(JSON.stringify(message))
  })

  ws.on('close', () => {
    ws.isAlive = false
    ws.terminate()
  })

  /**
   * Create new party room.
   */
  ws.on('createParty', (body: CreatePartyBody) => {
    const partyRoom = new PartyRoom(
      body.restaurantID,
      body.title,
      body.address,
      body.capacity,
      ws
    )

    partyRoomList[partyRoom.id] = partyRoom
    ws.transitionTo(new InRoom())

    // notify
    partyServer.clients.forEach((ws: PartyWS) => {
      ws.state.notifyNewParty(partyRoom)
    })
  })
})

partyServer.on('close', () => {
  clearInterval(heartbeat)
})

export default partyServer
