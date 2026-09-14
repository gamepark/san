import { Locator } from '@gamepark/react-game'
import { CENTRAL_PORT_X, VIRUS_TRACK_Y } from './SanLayout'

/** The Central Port tile, centred between the two players, in the middle of the Virus track. */
class CentralPortAreaLocator extends Locator {
  getCoordinates() {
    return { x: CENTRAL_PORT_X, y: VIRUS_TRACK_Y }
  }

  /** The tile's long side follows the Virus track, now running left-to-right between the players. */
  getRotateZ() {
    return 90
  }
}

export const centralPortAreaLocator = new CentralPortAreaLocator()
