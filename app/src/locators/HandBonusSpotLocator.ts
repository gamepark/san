import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { HAND_BONUS_SPOT_Y, playerSide, trackX } from './SanLayout'

/** A "Bonus de main" token still on the Propaganda track (location.player = its Corporation, location.x = the step it sits on), on that Corporation's track, turned towards their owner. */
class HandBonusSpotLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    return { x: trackX(location.x ?? 0, context), y: HAND_BONUS_SPOT_Y * playerSide(location.player!, context) }
  }

  getRotateZ(location: Location, context: MaterialContext) {
    return playerSide(location.player!, context) === 1 ? 90 : 270
  }
}

export const handBonusSpotLocator = new HandBonusSpotLocator()
