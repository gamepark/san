import { getRelativePlayerIndex, ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { PLAY_AREA_GAP, PLAY_AREA_Y, side } from './SanLayout'

/** Cards a Corporation has played in front of itself this turn, in a row. */
class PlayAreaLocator extends ListLocator {
  gap = { x: PLAY_AREA_GAP }

  getCoordinates(location: Location, context: MaterialContext) {
    const s = side(getRelativePlayerIndex(context, location.player))
    return { x: -PLAY_AREA_GAP, y: PLAY_AREA_Y * s }
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const playAreaLocator = new PlayAreaLocator()
