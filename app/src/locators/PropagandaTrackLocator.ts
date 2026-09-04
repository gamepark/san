import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { BANNER_Y, boardFlip, fixedSide, trackX } from './SanLayout'

/** Position of a Corporation's banner on the Propaganda track (location.x = step 0..6), just off the River on its permanent side. */
class PropagandaTrackLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    return { x: trackX(location.x ?? 0) * f, y: BANNER_Y * fixedSide(location.player!) * f }
  }

  /** A standing banner keeps a fixed orientation: it never follows the board's half-turn like a flat card. */
  getRotateZ() {
    return 0
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const propagandaTrackLocator = new PropagandaTrackLocator()
