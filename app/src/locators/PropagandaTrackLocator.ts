import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { BANNER_Y, playerSide, trackX } from './SanLayout'

/** Position of a Corporation's banner on its Propaganda track (location.x = step 0..6), across the River cards on its side. */
class PropagandaTrackLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    return { x: trackX(location.x ?? 0, context), y: BANNER_Y * playerSide(location.player!, context) }
  }
}

export const propagandaTrackLocator = new PropagandaTrackLocator()
