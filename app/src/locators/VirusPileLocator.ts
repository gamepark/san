import { ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { fixedSide, VIRUS_PILE_Y, VIRUS_TRACK_X } from './SanLayout'

/** A Corporation's stack of its 5 Virus cards, on its permanent side of the Central Port, slightly fanned so every number shows. */
class VirusPileLocator extends ListLocator {

  getRotateZ(location: Location, _context: MaterialContext): number {
    return fixedSide(location.player!) === 1 ? 180 : 0
  }

  getCoordinates(location: Location, _context: MaterialContext) {
    return { x: VIRUS_TRACK_X, y: VIRUS_PILE_Y * fixedSide(location.player!) }
  }
}

export const virusPileLocator = new VirusPileLocator()
