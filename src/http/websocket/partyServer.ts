import WebSocket from 'ws'
import User from '@/models/User'
import { HttpRequest } from '@/http/HttpHandler'
import ms from 'ms'
import PartyManager, { PartyRoom } from '@/modules/internal/PartyManager'

export interface PartyWS extends WebSocket {
  isAlive: boolean
  user: User
  joinedParty: string
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

// create websocket server
const partyServer = new WebSocket.Server({ noServer: true })

// set interval for checking if each connection is alive
const aliveCheckingSchedule = setInterval(() => {
  partyServer.clients.forEach((ws: PartyWS) => {
    // broken connection
    if (ws.isAlive === false) {
      ws.terminate()
    }

    // send ping for alive checking
    ws.isAlive = false
    ws.emit('semiPing')
    // ws.ping()
  })
}, ms('30s'))

partyServer.on('connection', (ws: PartyWS, req: HttpRequest) => {
  ws.isAlive = true
  ws.user = req.user as User
  ws.joinedParty = null

  ws.on('semiPing', () => {
    const message: PartyMessage = {
      operation: 'ping'
    }

    ws.send(JSON.stringify(message))
  })

  ws.on('pong', () => {
    ws.isAlive = true
  })

  // ws.on('close', (code, reason) => {})

  ws.on('message', msg => {
    const message: PartyMessage = JSON.parse(msg as string)

    console.log(JSON.stringify(message))

    // check if registered operation
    if (ws.listeners(message.operation).length > 0) {
      ws.emit(message.operation, message.body)
    } else {
      ws.send('ERROR: wrong type operation')
    }
  })

  ws.on('createParty', (body: CreatePartyBody) => {
    PartyManager.I.createParty(
      ws,
      body.restaurantID,
      body.title,
      body.address,
      body.capacity
    ).then()
  })

  ws.on('notifyNewParty', (newPartyID: string, newParty: PartyRoom) => {
    const message: PartyMessage = {
      operation: 'notifyNewParty',
      body: {
        id: newPartyID,
        restaurantName: newParty.restaurant.get('name'),
        title: newParty.title,
        address: newParty.address,
        capacity: newParty.capacity
      }
    }

    ws.send(JSON.stringify(message))
  })
})

partyServer.on('close', () => {
  clearInterval(aliveCheckingSchedule)
})

export default partyServer
