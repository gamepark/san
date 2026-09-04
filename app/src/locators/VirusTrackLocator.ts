import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { boardFlip, CENTRAL_PORT_Y, VIRUS_STEP_Y, VIRUS_TRACK_X } from './SanLayout'

/**
 * Position of the Virus pawn along the vertical Virus track (location.x = signed step: negative on the
 * Moon side, positive on the Star side, 0 = Central Port).
 */
class VirusTrackLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    return { x: VIRUS_TRACK_X * f, y: (CENTRAL_PORT_Y + (location.x ?? 0) * VIRUS_STEP_Y) * f, z: 2 }
  }

  /** The pawn is a standee: it keeps a fixed orientation and never follows the board's half-turn. */
  getRotateZ() {
    return 0
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const virusTrackLocator = new VirusTrackLocator()
