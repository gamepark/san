import { HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { CARD_HEIGHT, HAND_GAP_ANGLE, HAND_MAX_ANGLE, HAND_RADIUS, HAND_X, HAND_Y, HAND_Z, isNear, playerSide } from './SanLayout'

/**
 * A Corporation's hand, along its edge of the table: a wide, nearly flat fan where each card slightly
 * covers the next, laid over the lower part of the Corruption slots. The opponent's hand is face down and fans towards them.
 */
class PlayerHandLocator extends HandLocator {
  radius = HAND_RADIUS
  gapMaxAngle = HAND_GAP_ANGLE
  maxAngle = HAND_MAX_ANGLE

  getCoordinates(location: Location, context: MaterialContext) {
    return { x: HAND_X, y: HAND_Y * playerSide(location.player!, context), z: HAND_Z }
  }

  getBaseAngle(location: Location, context: MaterialContext) {
    return isNear(location.player!, context) ? 0 : 180
  }

  /**
   * Doubled and put straight, as the default does, but lifted by half a card first: the hand runs along
   * the bottom edge of the table, and a card doubled in place would grow half of itself off the screen.
   * The opponent's cards are face down: nothing to read there.
   */
  getHoverTransform(item: MaterialItem, context: ItemContext) {
    if (!isNear(item.location.player!, context)) return []
    return ['translateZ(10em)', `rotateZ(${-this.getItemRotateZ(item, context)}deg)`, `translateY(${-CARD_HEIGHT / 2}em)`, 'scale(2)']
  }
}

export const playerHandLocator = new PlayerHandLocator()
