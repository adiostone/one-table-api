import Restaurant from '@/models/Restaurant'
import WebSocket from 'ws'
import ms from 'ms'
import { HttpRequest } from '@/http/HttpHandler'

export interface OrderManagingWS extends WebSocket {
  isAlive: boolean
  restaurant: Restaurant
}

interface OrderManagingMessage {
  operation: string
  body?: {}
}

interface ErrorBody {
  errorOperation: string
  errorMessage: string
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
  }
)

orderManagingServer.on('close', () => {
  clearInterval(heartbeat)
})

export default orderManagingServer
