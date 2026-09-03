import { getRelativePlayerIndex, HandLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { HAND_RADIUS, HAND_X, HAND_Y, side } from './SanLayout'

/** A Corporation's hand, fanned along the edge of the table on its side. */
class PlayerHandLocator extends HandLocator {
  radius = HAND_RADIUS
  maxAngle = 12

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
