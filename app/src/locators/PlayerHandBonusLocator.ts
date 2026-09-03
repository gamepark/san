import { getRelativePlayerIndex, Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { PLAYER_HAND_BONUS_GAP, PLAYER_HAND_BONUS_X, PLAYER_HAND_BONUS_Y, side } from './SanLayout'

/** "Bonus de main" tokens a Corporation has collected, kept next to its deck (location.x = 0..1). */
class PlayerHandBonusLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: PLAYER_HAND_BONUS_X + (location.x ?? 0) * PLAYER_HAND_BONUS_GAP, y: PLAYER_HAND_BONUS_Y * s }
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const playerHandBonusLocator = new PlayerHandBonusLocator()
