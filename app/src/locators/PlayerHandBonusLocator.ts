import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { fixedSide, PLAYER_HAND_BONUS_GAP, PLAYER_HAND_BONUS_X, PLAYER_HAND_BONUS_Y } from './SanLayout'

/** "Bonus de main" tokens a Corporation has collected, kept next to its deck on its permanent side (location.x = 0..1). */
class PlayerHandBonusLocator extends Locator {
  getCoordinates(location: Location, _context: MaterialContext) {
    return {
      x: PLAYER_HAND_BONUS_X + (location.x ?? 0) * PLAYER_HAND_BONUS_GAP,
      y: PLAYER_HAND_BONUS_Y * fixedSide(location.player!)
    }
  }
}

export const playerHandBonusLocator = new PlayerHandBonusLocator()
