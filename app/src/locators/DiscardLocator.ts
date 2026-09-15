import { DeckLocator, LocationDescription } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { Corporation } from '@gamepark/san/Corporation'
import { CARD_HEIGHT, CARD_WIDTH, cornerSide, DISCARD_X, DISCARD_Y } from './SanLayout'
import { PlayerResourceCounters } from '../material/PlayerResourceCounters'

/** A Corporation's face-up discard pile, next to its draw pile, in its personal corner below the River. */
class DiscardLocator extends DeckLocator {
  limit = 30

  getCoordinates(location: Location) {
    return { x: cornerSide(location.player!) * DISCARD_X, y: DISCARD_Y }
  }

  /**
   * One static location per Corporation, always present — unlike the real Discard, which starts (and
   * can stay) empty — so the per-turn resource counters (moved here from the player panels, see
   * PlayerResourceCounters) always have the pile's own spot to render above, whether or not it holds
   * any card yet.
   */
  locations = [{ player: Corporation.Moon }, { player: Corporation.Star }]
  locationDescription = new DiscardCountersLocationDescription()
}

class DiscardCountersLocationDescription extends LocationDescription {
  width = CARD_WIDTH
  height = CARD_HEIGHT
  content = PlayerResourceCounters
}

export const discardLocator = new DiscardLocator()
