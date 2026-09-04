import { ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { boardFlip, boardFlipRotation, fixedSide, PLAY_AREA_GAP, PLAY_AREA_Y } from './SanLayout'

/** Cards a Corporation has played in front of itself this turn, in a row on its permanent side. */
class PlayAreaLocator extends ListLocator {
  getCoordinates(location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    return { x: -PLAY_AREA_GAP * f, y: PLAY_AREA_Y * fixedSide(location.player!) * f }
  }

  getGap(_location: Location, context: MaterialContext) {
    return { x: PLAY_AREA_GAP * boardFlip(context) }
  }

  getRotateZ(_location: Location, context: MaterialContext) {
    return boardFlipRotation(context)
  }

  getPositionDependencies(location: Location, context: MaterialContext) {
    return { count: this.countItems(location, context), viewer: context.player }
  }
}

export const playAreaLocator = new PlayAreaLocator()
