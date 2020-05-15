import { SimpleHandler } from '@/http/HttpHandler'
import partyServer from '@/modules/internal/party/partyServer'

export default class TablePartyController {
  public static upgradeToWebSocket: SimpleHandler = (req, res) => {
    partyServer.handleUpgrade(req, req.socket, Buffer.from(''), ws => {
      partyServer.emit('connection', ws, req)
    })
  }
}
