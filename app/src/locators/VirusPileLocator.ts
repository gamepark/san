import { ListLocator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { cornerSide, VIRUS_PILE_X, VIRUS_TRACK_Y } from './SanLayout'

/** A Corporation's stack of its 5 Virus cards, on its side of the Central Port — Star's pile on the left, Moon's on the right — slightly fanned so every number shows. */
class VirusPileLocator extends ListLocator {

  getRotateZ(location: Location): number {
    return (cornerSide(location.player!) === -1 ? 180 : 0) + 90
  }

  getCoordinates(location: Location) {
    return { x: cornerSide(location.player!) * VIRUS_PILE_X, y: VIRUS_TRACK_Y }
  }
}

export const virusPileLocator = new VirusPileLocator()
