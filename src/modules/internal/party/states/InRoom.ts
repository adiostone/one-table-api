import State from '@/modules/internal/party/states/State'
import PartyRoom from '@/modules/internal/party/PartyRoom'
import User from '@/models/User'

interface NotifyNewMemberBody {
  size: number
  user: {
    id: string
    nickname: string
    image: string
  }
}

interface NotifyOutMemberBody {
  size: number
  user: {
    id: string
  }
}

export default class InRoom extends State {
  public notifyNewParty(newPartyRoom: PartyRoom): void {
    // do nothing
  }

  public notifyJoinParty(partyRoom: PartyRoom, newMember: User): void {
    // only notify to members in same party except new member
    if (
      this._ws.roomID === partyRoom.id &&
      this._ws.user.get('id') !== newMember.get('id')
    ) {
      const operation = 'notifyNewMember'
      const body: NotifyNewMemberBody = {
        size: partyRoom.members.length,
        user: {
          id: newMember.get('id'),
          nickname: newMember.get('nickname'),
          image: newMember.get('image')
        }
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

  public notifyLeaveParty(partyRoom: PartyRoom, outMember: User): void {
    // only notify to members in same party except out member
    if (this._ws.roomID === partyRoom.id) {
      const operation = 'notifyOutMember'
      const body: NotifyOutMemberBody = {
        size: partyRoom.members.length,
        user: {
          id: outMember.get('id')
        }
      }

      this._ws.emit('sendPartyMessage', operation, body)
    }
  }

}
