import { Locator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { BANNER_Y, CENTRE_Y, fixedSide, trackX } from './SanLayout'

/** Position of a Corporation's banner on the Propaganda track (location.x = step 0..6), just off the River on its permanent side. */
class PropagandaTrackLocator extends Locator {
  getCoordinates(location: Location) {
    return { x: trackX(location.x ?? 0), y: CENTRE_Y + BANNER_Y * fixedSide(location.player!) }
  }
}

export const propagandaTrackLocator = new PropagandaTrackLocator()
