import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import Logger from '@/modules/log/Logger'

const expo = new Expo()

export default class Push {
  private readonly validMessages: ExpoPushMessage[]

  public constructor() {
    this.validMessages = []
  }

  public addToMessageQueue(message: ExpoPushMessage): void {
    if (Array.isArray(message.to)) {
      message.to = message.to.filter(token => Expo.isExpoPushToken(token))
    } else {
      message.to = Expo.isExpoPushToken(message.to) ? [message.to] : []
    }

    if (message.to.length !== 0) {
      this.validMessages.push(message)
    }
  }

  public async sendPushMessages(): Promise<void> {
    const chunks = expo.chunkPushNotifications(this.validMessages)

    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk)
      } catch (e) {
        Logger.I.log('error', `SEND PUSH MESSAGES ERROR: ${e}`)
      }
    }
  }
}
