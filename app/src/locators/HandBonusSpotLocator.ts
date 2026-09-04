import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { boardFlip, boardFlipRotation, fixedSide, HAND_BONUS_SPOT_Y, trackX } from './SanLayout'

/** A "Bonus de main" token still on the Propaganda track (location.player = its Corporation, location.x = the step it sits on), on that Corporation's permanent side. */
class HandBonusSpotLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    return { x: trackX(location.x ?? 0) * f, y: HAND_BONUS_SPOT_Y * fixedSide(location.player!) * f }
  }

  getRotateZ(_location: Location, context: MaterialContext) {
    return 90 + boardFlipRotation(context)
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const handBonusSpotLocator = new HandBonusSpotLocator()
