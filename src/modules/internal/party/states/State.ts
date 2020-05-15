import { PartyWS } from '@/modules/internal/party/partyServer'
import PartyRoom from '@/modules/internal/party/PartyRoom'

export default abstract class State {
  protected _ws: PartyWS

  public set ws(ws: PartyWS) {
    this._ws = ws
  }

  public abstract notifyNewParty(newPartyRoom: PartyRoom): void
}
