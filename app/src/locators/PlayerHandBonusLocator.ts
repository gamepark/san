import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { PLAYER_HAND_BONUS_GAP, PLAYER_HAND_BONUS_X, PLAYER_HAND_BONUS_Y, playerSide } from './SanLayout'

/** "Bonus de main" tokens a Corporation has collected, side by side on the Reserve side of its Deck (location.x = 0..1), turned towards their owner. */
class PlayerHandBonusLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    return {
      x: PLAYER_HAND_BONUS_X + ((location.x ?? 0) - 0.5) * PLAYER_HAND_BONUS_GAP,
      y: PLAYER_HAND_BONUS_Y * playerSide(location.player!, context)
    }
  }

  getRotateZ(location: Location, context: MaterialContext) {
    return playerSide(location.player!, context) === 1 ? 0 : 180
  }
}

export const playerHandBonusLocator = new PlayerHandBonusLocator()
