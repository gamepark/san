import { ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { boardFlip, boardFlipRotation, fixedSide, VIRUS_PILE_Y, VIRUS_TRACK_X } from './SanLayout'

/** A Corporation's stack of its 5 Virus cards, on its permanent side of the Central Port, slightly fanned so every number shows. */
class VirusPileLocator extends ListLocator {

  getRotateZ(location: Location, context: MaterialContext): number {
    return ((fixedSide(location.player!) === 1 ? 180 : 0) + boardFlipRotation(context)) % 360
  }

  getCoordinates(location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    return { x: VIRUS_TRACK_X * f, y: VIRUS_PILE_Y * fixedSide(location.player!) * f }
  }

  getPositionDependencies(location: Location, context: MaterialContext) {
    return { count: this.countItems(location, context), viewer: context.player }
  }
}

export const virusPileLocator = new VirusPileLocator()
