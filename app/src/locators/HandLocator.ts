import { getRelativePlayerIndex, HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { HAND_RADIUS, HAND_X, HAND_Y, side } from './SanLayout'

/** A Corporation's hand, fanned along the bottom edge of the table. Only the viewing player's hand is shown. */
class PlayerHandLocator extends HandLocator {
  radius = HAND_RADIUS
  maxAngle = 12

  /** A player only ever sees their own hand; spectators see both. */
  hide(item: MaterialItem, context: ItemContext): boolean {
    return context.player !== undefined && item.location.player !== context.player
  }

  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: HAND_X, y: HAND_Y * s }
  }

  getBaseAngle(location: Location, context: MaterialContext) {
    return side(getRelativePlayerIndex(context, location.player)) === 1 ? 0 : 180
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const playerHandLocator = new PlayerHandLocator()
