import { ListLocator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { cornerSide, DECK_X, PLAY_AREA_GAP, PLAY_AREA_Y } from './SanLayout'

/** Cards a Corporation has played in front of itself this turn, in a row just above its Deck. */
class PlayAreaLocator extends ListLocator {
  getCoordinates(location: Location) {
    return { x: cornerSide(location.player!) * DECK_X, y: PLAY_AREA_Y }
  }

  // Fans toward the table centre, not toward its edge — the anchor (above the Deck) already sits close
  // to the edge, so fanning further outward pushed cards off the table once several were in play.
  getGap(location: Location) {
    return { x: -PLAY_AREA_GAP * cornerSide(location.player!) }
  }
}

export const playAreaLocator = new PlayAreaLocator()
