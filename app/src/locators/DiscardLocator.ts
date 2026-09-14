import { DeckLocator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { cornerSide, DISCARD_X, DISCARD_Y } from './SanLayout'

/** A Corporation's face-up discard pile, next to its draw pile, in its personal corner below the River. */
class DiscardLocator extends DeckLocator {
  limit = 30

  getCoordinates(location: Location) {
    return { x: cornerSide(location.player!) * DISCARD_X, y: DISCARD_Y }
  }
}

export const discardLocator = new DiscardLocator()
