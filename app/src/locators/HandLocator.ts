import { HandLocator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { cornerSide, HAND_RADIUS, HAND_X, HAND_Y } from './SanLayout'

/** A Corporation's hand, fanned in its personal corner below the River (Star bottom-left, Moon bottom-right). Both hands are shown, face down for the opponent. */
class PlayerHandLocator extends HandLocator {
  radius = HAND_RADIUS
  maxAngle = 12

  getCoordinates(location: Location) {
    return { x: cornerSide(location.player!) * HAND_X, y: HAND_Y }
  }
}

export const playerHandLocator = new PlayerHandLocator()
