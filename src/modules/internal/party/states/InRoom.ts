import State from '@/modules/internal/party/states/State'
import PartyRoom, { Chat, Member } from '@/modules/internal/party/PartyRoom'

interface NotifyNewMemberBody {
  size: number
  user: {
    id: string
    nickname: string
    image: string
    isHost: boolean
    isReady: boolean
  }
}

interface NotifyOutMemberBody {
  size: number
  user: {
    id: string
  }
  newHost?: {
    id: string
  }
}

interface NotifyKickedOutMemberBody {
  size: number
  user: {
    id: string
  }
}

type NotifyNewChatBody = Chat

export default class InRoom extends State {
  public notifyNewParty(newPartyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyJoinParty(partyRoom: PartyRoom, newMember: Member): void {
    // only notify to members in same party except new member
    if (this._ws.roomID === partyRoom.id && this._ws !== newMember.ws) {
      const operation = 'notifyNewMember'
      const body: NotifyNewMemberBody = {
        size: partyRoom.size,
        user: {
          id: newMember.ws.user.get('id'),
          nickname: newMember.ws.user.get('nickname'),
          image: newMember.ws.user.get('image'),
          isHost: newMember.isHost,
          isReady: newMember.isReady
        }
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyLeaveParty(partyRoom: PartyRoom, outMember: Member): void {
    // only notify to members in same party
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyOutMember'
      const body: NotifyOutMemberBody = {
        size: partyRoom.size,
        user: {
          id: outMember.ws.user.get('id')
        }
      }

      // check if out member is old host,
      // additionally notice the new host
      if (outMember.isHost) {
        body.newHost = {
          id: partyRoom.host.ws.user.get('id')
        }
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyDeleteParty(partyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyKickedOutMember(partyRoom: PartyRoom, outMember: Member): void {
    // only notify to members in same party
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyKickedOutMember'
      const body: NotifyKickedOutMemberBody = {
        size: partyRoom.size,
        user: {
          id: outMember.ws.user.get('id')
        }
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyNewChat(partyRoom: PartyRoom): void {
    // only notify to members in same party
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyNewChat'
      const body: NotifyNewChatBody = partyRoom.chats.slice(-1)[0]

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }
}
