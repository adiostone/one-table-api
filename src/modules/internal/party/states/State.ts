import { PartyWS } from '@/modules/internal/party/partyServer'
import PartyRoom, { Member } from '@/modules/internal/party/PartyRoom'

export default abstract class State {
  protected _ws: PartyWS

  public set ws(ws: PartyWS) {
    this._ws = ws
  }

  public abstract notifyNewParty(newPartyRoom: PartyRoom): void

  public abstract notifyJoinParty(partyRoom: PartyRoom, newMember: Member): void

  public abstract notifyLeaveParty(
    partyRoom: PartyRoom,
    outMember: Member
  ): void

  public abstract notifyDeleteParty(partyRoom: PartyRoom): void

  public abstract notifyKickedOutMember(
    partyRoom: PartyRoom,
    outMember: Member
  ): void

  public abstract notifyNewChat(partyRoom: PartyRoom): void
}
