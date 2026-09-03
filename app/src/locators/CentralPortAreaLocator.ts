import { Locator } from '@gamepark/react-game'
import { CENTRAL_PORT_Y, VIRUS_TRACK_X } from './SanLayout'

/** The Central Port tile, at the middle of the Virus track. */
class CentralPortAreaLocator extends Locator {
  getCoordinates() {
    return { x: VIRUS_TRACK_X, y: CENTRAL_PORT_Y }
  }
}

export const centralPortAreaLocator = new CentralPortAreaLocator()
