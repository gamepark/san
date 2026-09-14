import { DeckLocator } from '@gamepark/react-game'
import { RESERVE_X, RESERVE_Y } from './SanLayout'

/** The face-up Reserve pile, used to refill the River. */
class ReserveLocator extends DeckLocator {
  limit = 30

  getCoordinates() {
    return { x: RESERVE_X, y: RESERVE_Y }
  }
}

export const reserveLocator = new ReserveLocator()
