import { getRelativePlayerIndex, Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { BANNER_Y, side, trackX } from './SanLayout'

/** Position of a Corporation's banner on the Propaganda track (location.x = step 0..6), just off the River on its side. */
class PropagandaTrackLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: trackX(location.x ?? 0), y: BANNER_Y * s }
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const propagandaTrackLocator = new PropagandaTrackLocator()
