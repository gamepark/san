import { DeckLocator, getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { DECK_X, DECK_Y, side } from './SanLayout'

/** A Corporation's face-down draw pile, near its panel. */
class PlayerDeckLocator extends DeckLocator {
  limit = 12

  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: DECK_X, y: DECK_Y * s }
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const playerDeckLocator = new PlayerDeckLocator()
