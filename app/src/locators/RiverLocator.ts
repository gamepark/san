import { ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { boardFlip, boardFlipRotation, RIVER_GAP, RIVER_Y, riverX } from './SanLayout'

/** The 6 face-up River cards, in a centred row (also the board of the Propaganda track). */
class RiverLocator extends ListLocator {
  getCoordinates(_location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    return { x: riverX(0) * f, y: RIVER_Y * f }
  }

  getGap(_location: Location, context: MaterialContext) {
    return { x: RIVER_GAP * boardFlip(context) }
  }

  getRotateZ(_location: Location, context: MaterialContext) {
    return boardFlipRotation(context)
  }

  getPositionDependencies(location: Location, context: MaterialContext) {
    return { count: this.countItems(location, context), viewer: context.player }
  }
}

export const riverLocator = new RiverLocator()
