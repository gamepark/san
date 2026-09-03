import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { fixedSide, HAND_BONUS_SPOT_Y, trackX } from './SanLayout'

/** A "Bonus de main" token still on the Propaganda track (location.player = its Corporation, location.x = the step it sits on), on that Corporation's permanent side. */
class HandBonusSpotLocator extends Locator {
  rotateZ = 90

  getCoordinates(location: Location, _context: MaterialContext) {
    return { x: trackX(location.x ?? 0), y: HAND_BONUS_SPOT_Y * fixedSide(location.player!) }
  }
}

export const handBonusSpotLocator = new HandBonusSpotLocator()
