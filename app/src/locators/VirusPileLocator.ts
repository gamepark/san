import { getRelativePlayerIndex, ListLocator, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'
import { side, VIRUS_PILE_GAP, VIRUS_PILE_Y, VIRUS_TRACK_X } from './SanLayout'

/** A Corporation's stack of its 5 Virus cards, on its side of the Central Port, slightly fanned so every number shows. */
class VirusPileLocator extends ListLocator {

  getRotateZ(location: Location, context: MaterialContext): number {
    const s = side(getRelativePlayerIndex(context, location.player))
    return s === 1 ? 180 : 0
  }

  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: VIRUS_TRACK_X, y: VIRUS_PILE_Y * s }
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const virusPileLocator = new VirusPileLocator()
