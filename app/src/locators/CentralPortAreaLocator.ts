import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { boardFlip, boardFlipRotation, CENTRAL_PORT_Y, VIRUS_TRACK_X } from './SanLayout'

/** The Central Port tile, at the middle of the Virus track. */
class CentralPortAreaLocator extends Locator {
  getCoordinates(_location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    return { x: VIRUS_TRACK_X * f, y: CENTRAL_PORT_Y * f }
  }

  getRotateZ(_location: Location, context: MaterialContext) {
    return boardFlipRotation(context)
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const centralPortAreaLocator = new CentralPortAreaLocator()
