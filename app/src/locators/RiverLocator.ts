import { ListLocator } from '@gamepark/react-game'
import { RIVER_GAP, RIVER_Y, riverX } from './SanLayout'

/** The 6 face-up River cards, in a centred row (also the board of the Propaganda track). */
class RiverLocator extends ListLocator {
  getCoordinates() {
    return { x: riverX(0), y: RIVER_Y }
  }

  getGap() {
    return { x: RIVER_GAP }
  }
}

export const riverLocator = new RiverLocator()
