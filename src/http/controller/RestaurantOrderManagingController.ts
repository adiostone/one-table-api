import { SimpleHandler } from '@/http/HttpHandler'
import Restaurant from '@/models/Restaurant'
import orderManagingServer, {
  OrderManagingWS
} from '@/modules/internal/order-managing/orderManagingServer'

export default class RestaurantOrderManagingController {
  public static upgradeToWebSocket: SimpleHandler = (req, res) => {
    const restaurant = res.locals.restaurant as Restaurant

    // close previous connection from same user
    orderManagingServer.clients.forEach((ws: OrderManagingWS) => {
      if (
        ws.restaurant !== undefined &&
        ws.restaurant.get('id') === restaurant.get('id')
      ) {
        ws.emit('close')
      }
    })

    orderManagingServer.handleUpgrade(req, req.socket, Buffer.from(''), ws => {
      orderManagingServer.emit('connection', ws, req, restaurant)
    })
  }
}
