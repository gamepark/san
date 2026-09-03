import { ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { fixedSide, PLAY_AREA_GAP, PLAY_AREA_Y } from './SanLayout'

/** Cards a Corporation has played in front of itself this turn, in a row on its permanent side. */
class PlayAreaLocator extends ListLocator {
  gap = { x: PLAY_AREA_GAP }

  getCoordinates(location: Location, _context: MaterialContext) {
    return { x: -PLAY_AREA_GAP, y: PLAY_AREA_Y * fixedSide(location.player!) }
  }
}

export const playAreaLocator = new PlayAreaLocator()
