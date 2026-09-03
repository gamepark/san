import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { BANNER_Y, fixedSide, trackX } from './SanLayout'

/** Position of a Corporation's banner on the Propaganda track (location.x = step 0..6), just off the River on its permanent side. */
class PropagandaTrackLocator extends Locator {
  getCoordinates(location: Location, _context: MaterialContext) {
    return { x: trackX(location.x ?? 0), y: BANNER_Y * fixedSide(location.player!) }
  }
}

export const propagandaTrackLocator = new PropagandaTrackLocator()
