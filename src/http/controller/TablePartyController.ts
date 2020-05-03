import { SimpleHandler } from '@/http/HttpHandler'
import partyWS from '@/modules/internal/partyWebSocket'

export default class TablePartyController {
  public static upgradeToWebSocket: SimpleHandler = (req, res) => {
    partyWS.handleUpgrade(req, req.socket, Buffer.from(''), ws => {
      partyWS.emit('connection', ws, req)
    })
  }
}
