import { DeckLocator, getRelativePlayerIndex, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { DECK_X, DECK_Y, side } from './SanLayout'

/** A Corporation's face-down draw pile, near its panel. Only the viewing player's deck is shown. */
class PlayerDeckLocator extends DeckLocator {
  limit = 12

  /** A player only ever sees their own deck; spectators see both. */
  hide(item: MaterialItem, context: ItemContext): boolean {
    return context.player !== undefined && item.location.player !== context.player
  }

  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: DECK_X, y: DECK_Y * s }
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const playerDeckLocator = new PlayerDeckLocator()
