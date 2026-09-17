import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { BANNER_Y, isNear, NEAR_BANNER_Y, trackX } from './SanLayout'

/** Position of a Corporation's banner on its Propaganda track (location.x = step 0..6), across the River cards on its side. */
class PropagandaTrackLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    return { x: trackX(location.x ?? 0, context), y: isNear(location.player!, context) ? NEAR_BANNER_Y : -BANNER_Y }
  }
}

export const propagandaTrackLocator = new PropagandaTrackLocator()
