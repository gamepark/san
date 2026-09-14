import { DeckLocator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { cornerSide, DECK_X, DECK_Y } from './SanLayout'

/** A Corporation's face-down draw pile, in its personal corner below the River (Star bottom-left, Moon bottom-right). Both decks are shown. */
class PlayerDeckLocator extends DeckLocator {
  limit = 12

  getCoordinates(location: Location) {
    return { x: cornerSide(location.player!) * DECK_X, y: DECK_Y }
  }
}

export const playerDeckLocator = new PlayerDeckLocator()
