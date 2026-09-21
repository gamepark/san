import { DeckLocator } from '@gamepark/react-game'
import { RESERVE_X, RESERVE_Y } from './SanLayout'

/** The Reserve pile, used to refill the River, left of it: face down except its top card. */
class ReserveLocator extends DeckLocator {
  coordinates = { x: RESERVE_X, y: RESERVE_Y }
  /** No browsing through the pile in the help dialog: only its top card is face up. */
  navigationSorts = []
}

export const reserveLocator = new ReserveLocator()
