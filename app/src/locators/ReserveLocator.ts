import { DeckLocator } from '@gamepark/react-game'
import { RESERVE_X, RESERVE_Y } from './SanLayout'

/** The face-up Reserve pile, used to refill the River, left of it. */
class ReserveLocator extends DeckLocator {
  coordinates = { x: RESERVE_X, y: RESERVE_Y }
}

export const reserveLocator = new ReserveLocator()
