import Restaurant from '@/models/Restaurant'
import WebSocket from 'ws'
import ms from 'ms'
import { HttpRequest } from '@/http/HttpHandler'
import PartyRoom from '@/modules/internal/party/PartyRoom'
import OrderInProgress, {
  OrderStatus
} from '@/modules/internal/order-managing/OrderInProgress'

export interface OrderManagingWS extends WebSocket {
  isAlive: boolean
  restaurant: Restaurant
  orderQueue: OrderInProgress[]
}

interface OrderManagingMessage {
  operation: string
  body?: {}
}

interface ErrorBody {
  errorOperation: string
  errorMessage: string
}

interface ByCustomer {
  phoneNumber: string
  isNonF2F: boolean
  address: string
  request: string
  menus: {
    id: number
    quantity: number
    isShared: boolean
    pricePerCapita: number
    name: string
    packagingCost: number
  }[]
  deliveryCostPerCapita: number
  nonF2FCost: number
  totalPrice: number
}

interface ByMenu {
  menus: {
    id: number
    quantity: number
    isShared: boolean
    menuTotalPrice: number
    name: string
  }[]
  totalPackagingCost: number
  deliveryCost: number
  totalNonF2FCost: number
  totalPrice: number
}

interface NotifyNewOrderBody {
  id: string
  byCustomer: ByCustomer[]
  byMenu: ByMenu
}

interface AcceptOrderBody {
  id: string
  estimatedTime: number
}

interface ReplyAcceptOrderBody {
  isSuccess: boolean
}

interface RefuseOrderBody {
  id: string
}

interface ReplyRefuseOrderBody {
  isSuccess: boolean
}

interface StartDeliveryBody {
  id: string
}

interface ReplyStartDeliveryBody {
  isSuccess: boolean
}

const orderManagingServer = new WebSocket.Server({ noServer: true })

// repeatedly check heartbeat of each clients
const heartbeat = setInterval(() => {
  orderManagingServer.clients.forEach((ws: OrderManagingWS) => {
    // broken connection
    if (ws.isAlive === false) {
      ws.emit('close')
    }

    ws.isAlive = false
    ws.emit('ping')
  })
}, ms('30s'))

orderManagingServer.on(
  'connection',
  (ws: OrderManagingWS, req: HttpRequest, restaurant: Restaurant) => {
    // initialize connection
    ws.isAlive = true
    ws.restaurant = restaurant
    ws.orderQueue = []

    /* Register events */

    ws.on('ping', () => {
      ws.emit('sendMessage', 'ping')
    })

    ws.on('pong', () => {
      ws.isAlive = true
    })

    /**
     * Receive message and decode it.
     * And then trigger proper event.
     */
    ws.on('message', msg => {
      console.log('incoming order managing msg: ' + msg)

      // decode received message
      const message: OrderManagingMessage = JSON.parse(msg as string)

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
     * Send all order managing message in encoded format.
     */
    ws.on('sendMessage', (operation, body?) => {
      const message: OrderManagingMessage = {
        operation: operation
      }

      if (body !== null) {
        message.body = body
      }

      console.log('send order managing message: ' + JSON.stringify(message))
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

      ws.emit('sendMessage', 'error', errorBody)
    })

    /**
     * Close order managing websocket connection.
     */
    ws.on('close', () => {
      ws.isAlive = false
      ws.close()
    })

    ws.on('notifyNewOrder', (partyRoom: PartyRoom) => {
      const order = new OrderInProgress(partyRoom)
      ws.orderQueue.push(order)

      const operation = 'notifyNewOrder'
      const body: NotifyNewOrderBody = {
        id: order.id,
        byCustomer: [] as ByCustomer[],
        byMenu: {} as ByMenu
      }

      /** by customer **/
      let sharedMenuTotalPrice = 0
      const sharedMenus = partyRoom.sharedCart.map(sharedMenu => {
        sharedMenuTotalPrice +=
          sharedMenu.pricePerCapita + partyRoom.restaurant.get('packagingCost')

        return {
          id: sharedMenu.id,
          quantity: sharedMenu.quantity,
          isShared: true,
          pricePerCapita: sharedMenu.pricePerCapita,
          name: sharedMenu.name,
          packagingCost: partyRoom.restaurant.get('packagingCost')
        }
      })

      for (const member of partyRoom.members) {
        let privateMenuTotalPrice = 0
        const privateMenus = member.cart.map(privateMenu => {
          privateMenuTotalPrice += privateMenu.pricePerCapita

          return {
            id: privateMenu.id,
            quantity: privateMenu.quantity,
            isShared: false,
            pricePerCapita: privateMenu.pricePerCapita,
            name: privateMenu.name,
            packagingCost: 0
          }
        })

        const customerInfo = {
          phoneNumber: member.phoneNumber,
          isNonF2F: member.isNonF2F,
          address: member.isNonF2F ? member.nonF2FAddress : partyRoom.address,
          request: member.request,
          menus: sharedMenus.concat(privateMenus),
          deliveryCostPerCapita: Math.floor(
            partyRoom.restaurant.get('deliveryCost') / partyRoom.size
          ),
          nonF2FCost: member.isNonF2F
            ? partyRoom.restaurant.get('nonF2FCost')
            : 0,
          totalPrice: 0
        }

        customerInfo.totalPrice =
          sharedMenuTotalPrice +
          privateMenuTotalPrice +
          customerInfo.deliveryCostPerCapita +
          customerInfo.nonF2FCost

        body.byCustomer.push(customerInfo)
      }

      /** by menu **/
      body.byMenu.totalPackagingCost = 0
      body.byMenu.deliveryCost = partyRoom.restaurant.get('deliveryCost')
      body.byMenu.totalNonF2FCost = 0
      body.byMenu.totalPrice = 0

      body.byMenu.menus = []
      for (const sharedMenu of partyRoom.sharedCart) {
        body.byMenu.menus.push({
          id: sharedMenu.id,
          quantity: sharedMenu.quantity,
          isShared: true,
          menuTotalPrice: sharedMenu.quantity * sharedMenu.unitPrice,
          name: sharedMenu.name
        })

        body.byMenu.totalPackagingCost +=
          partyRoom.size * partyRoom.restaurant.get('packagingCost')

        body.byMenu.totalPrice += sharedMenu.quantity * sharedMenu.unitPrice
      }

      for (const member of partyRoom.members) {
        for (const privateMenu of member.cart) {
          body.byMenu.menus.push({
            id: privateMenu.id,
            quantity: privateMenu.quantity,
            isShared: false,
            menuTotalPrice: privateMenu.pricePerCapita,
            name: privateMenu.name
          })

          body.byMenu.totalPrice += privateMenu.pricePerCapita
        }

        body.byMenu.totalNonF2FCost += member.isNonF2F
          ? partyRoom.restaurant.get('nonF2FCost')
          : 0
      }

      body.byMenu.totalPrice +=
        body.byMenu.totalPackagingCost +
        body.byMenu.deliveryCost +
        body.byMenu.totalNonF2FCost

      ws.emit('sendMessage', operation, body)
    })

    ws.on('acceptOrder', (body: AcceptOrderBody) => {
      const replyOperation = 'replyAcceptOrder'
      const replyBody: ReplyAcceptOrderBody = {
        isSuccess: true
      }

      // find order
      const order = ws.orderQueue.find(order => order.id === body.id)
      if (order === undefined) {
        replyBody.isSuccess = false
        ws.emit('sendMessage', replyOperation, replyBody)
        return
      }

      // accept
      order.status = OrderStatus.ACCEPTED
      ws.emit('sendMessage', replyOperation, replyBody)

      // notify to customers
      order.partyRoom.members.forEach(member => {
        member.ws.state.notifyOrderIsAccepted(
          order.partyRoom,
          body.estimatedTime
        )
      })
    })

    ws.on('refuseOrder', (body: RefuseOrderBody) => {
      const replyOperation = 'replyRefuseOrder'
      const replyBody: ReplyRefuseOrderBody = {
        isSuccess: true
      }

      // find order
      const orderIndex = ws.orderQueue.findIndex(order => order.id === body.id)
      if (orderIndex === -1) {
        replyBody.isSuccess = false
        ws.emit('sendMessage', replyOperation, replyBody)
        return
      }

      const order = ws.orderQueue[orderIndex]

      // remove order from order queue
      ws.orderQueue.splice(orderIndex, 1)
      ws.emit('sendMessage', replyOperation, replyBody)

      // notify to customers
      order.partyRoom.members.forEach(member => {
        member.ws.state.notifyOrderIsRefused(order.partyRoom)
      })
    })

    ws.on('startDelivery', (body: StartDeliveryBody) => {
      const replyOperation = 'replyStartDelivery'
      const replyBody: ReplyStartDeliveryBody = {
        isSuccess: true
      }

      // find order
      const order = ws.orderQueue.find(order => order.id === body.id)
      if (order === undefined) {
        replyBody.isSuccess = false
        ws.emit('sendMessage', replyOperation, replyBody)
        return
      }

      // order is completed and start delivery
      order.status = OrderStatus.COMPLETED
      ws.emit('sendMessage', replyOperation, replyBody)

      // notify to customers
      order.partyRoom.members.forEach(member => {
        member.ws.state.notifyStartDelivery(order.partyRoom)
      })
    })
  }
)

orderManagingServer.on('close', () => {
  clearInterval(heartbeat)
})

export default orderManagingServer
