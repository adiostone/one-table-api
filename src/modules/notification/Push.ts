import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import Logger from '@/modules/log/Logger'

const expo = new Expo()

export default class Push {
  /**
   * Singleton instance
   */
  private static _instance: Push

  private validMessages: ExpoPushMessage[]

  /**
   * Get singleton instance.
   */
  public static get I(): Push {
    if (this._instance === undefined) {
      this._instance = new this()
    }

    return this._instance
  }

  private constructor() {
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
