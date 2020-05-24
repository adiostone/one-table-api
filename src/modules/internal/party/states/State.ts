import { PartyWS } from '@/modules/internal/party/partyServer'
import PartyRoom from '@/modules/internal/party/PartyRoom'
import User from '@/models/User'

export default abstract class State {
  protected _ws: PartyWS

  public set ws(ws: PartyWS) {
    this._ws = ws
  }

  public abstract notifyNewParty(newPartyRoom: PartyRoom): void

  public abstract notifyJoinParty(partyRoom: PartyRoom, newMember: User): void

  public abstract notifyLeaveParty(
    partyRoom: PartyRoom,
    outMember: User,
    isHost: boolean
  ): void

  public abstract notifyDeleteParty(partyRoom: PartyRoom): void

  public abstract notifyKickedOutMember(
    partyRoom: PartyRoom,
    outMember: User
  ): void

  public abstract notifyNewChat(partyRoom: PartyRoom): void
}
