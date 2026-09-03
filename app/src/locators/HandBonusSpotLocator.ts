import { getRelativePlayerIndex, Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { HAND_BONUS_SPOT_Y, side, trackX } from './SanLayout'

/** A "Bonus de main" token still on the Propaganda track (location.player = its Corporation, location.x = the step it sits on). */
class HandBonusSpotLocator extends Locator {
  rotateZ = 90

  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: trackX(location.x ?? 0), y: HAND_BONUS_SPOT_Y * s }
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const handBonusSpotLocator = new HandBonusSpotLocator()
