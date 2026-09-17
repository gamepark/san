import { ListLocator, MaterialContext } from '@gamepark/react-game'
import { RIVER_GAP, riverDirection, riverX } from './SanLayout'

/** The 6 face-up River cards, in a row across the middle of the table (also the board of the Propaganda tracks). */
class RiverLocator extends ListLocator {
  getCoordinates(_location: unknown, context: MaterialContext) {
    return { x: riverX(0, context), y: 0 }
  }

  getGap(_location: unknown, context: MaterialContext) {
    return { x: RIVER_GAP * riverDirection(context) }
  }
}

export const riverLocator = new RiverLocator()
