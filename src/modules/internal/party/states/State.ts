import { PartyWS } from '@/modules/internal/party/partyServer'
import PartyRoom, {
  Member,
  MenuInCart
} from '@/modules/internal/party/PartyRoom'

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

  public abstract notifyNewSharedMenu(
    partyRoom: PartyRoom,
    menuInCart: MenuInCart
  ): void

  public abstract notifyUpdateSharedMenu(
    partyRoom: PartyRoom,
    menuInCart: MenuInCart
  ): void

  public abstract notifyDeleteSharedMenu(
    partyRoom: PartyRoom,
    menuInCart: MenuInCart
  ): void

  public abstract notifyAllMemberNotReady(partyRoom: PartyRoom): void

  public abstract notifyMemberSetReady(
    partyRoom: PartyRoom,
    member: Member
  ): void

  public abstract notifyRefreshSharedCart(
    partyRoom: PartyRoom,
    exceptMember?: Member
  ): void

  public abstract notifyRefreshTotalPrice(partyRoom: PartyRoom): void

  public abstract notifyGoToPayment(partyRoom: PartyRoom): void

  public abstract notifyOrderIsAccepted(
    partyRoom: PartyRoom,
    estimatedTime: number
  ): void

  public abstract notifyOrderIsRefused(partyRoom: PartyRoom): void

  public abstract notifyStartDelivery(partyRoom: PartyRoom): void

  public abstract notifyCompletePayment(
    partyRoom: PartyRoom,
    completeMember: Member
  ): void

  public abstract notifyMemberReceiveDelivery(
    partyRoom: PartyRoom,
    receiveMember: Member
  ): void
}
