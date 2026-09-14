import { Locator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { cornerSide, DECK_X, DECK_Y, DISCARD_X, PLAYER_HAND_BONUS_GAP } from './SanLayout'

/** "Bonus de main" tokens a Corporation has collected, between its Deck and Discard piles (location.x = 0..1). */
class PlayerHandBonusLocator extends Locator {
  getCoordinates(location: Location) {
    const side = cornerSide(location.player!)
    const slot = location.x ?? 0
    return {
      x: side * ((DECK_X + DISCARD_X) / 2),
      y: DECK_Y + (slot - 0.5) * PLAYER_HAND_BONUS_GAP
    }
  }

  getRotateZ() {
    return 90
  }
}

export const playerHandBonusLocator = new PlayerHandBonusLocator()
