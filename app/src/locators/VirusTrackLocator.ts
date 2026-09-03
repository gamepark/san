import { Locator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { CENTRAL_PORT_Y, VIRUS_STEP_Y, VIRUS_TRACK_X } from './SanLayout'

/**
 * Position of the Virus pawn along the vertical Virus track (location.x = signed step: negative on the
 * Moon side, positive on the Star side, 0 = Central Port).
 */
class VirusTrackLocator extends Locator {
  getCoordinates(location: Location) {
    return { x: VIRUS_TRACK_X, y: CENTRAL_PORT_Y + (location.x ?? 0) * VIRUS_STEP_Y, z: 2 }
  }
}

export const virusTrackLocator = new VirusTrackLocator()
