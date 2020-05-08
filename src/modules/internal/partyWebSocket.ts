import WebSocket from 'ws'
import User from '@/models/User'
import { HttpRequest } from '@/http/HttpHandler'
import ms from 'ms'

interface PartyWebSocket extends WebSocket {
  isAlive: boolean

  user: User
}

interface PartyMessage {
  operation: string
  body?: {}
}

// create websocket server
const partyWS = new WebSocket.Server({ noServer: true })

// set interval for checking if each connection is alive
const aliveCheckingSchedule = setInterval(() => {
  partyWS.clients.forEach((ws: PartyWebSocket) => {
    // broken connection
    if (ws.isAlive === false) {
      ws.terminate()
    }

    // send ping for alive checking
    ws.isAlive = false
    ws.ping()
  })
}, ms('30s'))

partyWS.on('connection', (ws: PartyWebSocket, req: HttpRequest) => {
  ws.isAlive = true
  ws.user = req.user as User

  ws.on('pong', () => {
    ws.isAlive = true
  })

  ws.on('message', msg => {
    const message: PartyMessage = JSON.parse(msg as string)

    // check if registered operation
    if (ws.listeners(message.operation).length > 0) {
      ws.emit(message.operation, message.body)
    } else {
      ws.send('ERROR: wrong type operation')
    }
  })
})

partyWS.on('close', () => {
  clearInterval(aliveCheckingSchedule)
})

export default partyWS
