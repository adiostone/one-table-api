import Restaurant from '@/models/Restaurant'
import WebSocket from 'ws'

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

export default orderManagingServer
