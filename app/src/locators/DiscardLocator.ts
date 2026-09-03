import { DeckLocator, getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { DISCARD_X, DISCARD_Y, side } from './SanLayout'

/** A Corporation's face-up discard pile, next to its draw pile. */
class DiscardLocator extends DeckLocator {
  limit = 30

  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: DISCARD_X, y: DISCARD_Y * s }
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const discardLocator = new DiscardLocator()
