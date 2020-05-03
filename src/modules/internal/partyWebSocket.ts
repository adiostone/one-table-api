import WebSocket from 'ws'
import User from '@/models/User'
import { HttpRequest } from '@/http/HttpHandler'
import ms from 'ms'

interface PartyWebSocket extends WebSocket {
  isAlive: boolean

  user: User
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
    console.log(msg)
    ws.send(`you said, ${msg}`)
  })
})

partyWS.on('close', () => {
  clearInterval(aliveCheckingSchedule)
})

export default partyWS
