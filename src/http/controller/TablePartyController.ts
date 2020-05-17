import { SimpleHandler } from '@/http/HttpHandler'
import partyServer, { PartyWS } from '@/modules/internal/party/partyServer'
import User from '@/models/User'

export default class TablePartyController {
  public static upgradeToWebSocket: SimpleHandler = (req, res) => {
    const user = req.user as User

    // close previous connection from same user
    partyServer.clients.forEach((ws: PartyWS) => {
      if (ws.user !== undefined && ws.user.get('id') === user.get('id')) {
        ws.emit('close')
      }
    })

    partyServer.handleUpgrade(req, req.socket, Buffer.from(''), ws => {
      partyServer.emit('connection', ws, req)
    })
  }
}
