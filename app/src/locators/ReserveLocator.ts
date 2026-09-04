import { DeckLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { boardFlip, boardFlipRotation, RESERVE_X, RESERVE_Y } from './SanLayout'

/** The face-up Reserve pile, used to refill the River. */
class ReserveLocator extends DeckLocator {
  limit = 30

  getCoordinates(_location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    return { x: RESERVE_X * f, y: RESERVE_Y * f }
  }

  getRotateZ(_location: Location, context: MaterialContext) {
    return boardFlipRotation(context)
  }

  getPositionDependencies(location: Location, context: MaterialContext) {
    return { count: this.countItems(location, context), viewer: context.player }
  }
}

export const reserveLocator = new ReserveLocator()
