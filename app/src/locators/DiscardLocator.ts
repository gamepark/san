import { DeckLocator, ItemContext, LocationDescription, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { Corporation } from '@gamepark/san/Corporation'
import { CARD_HEIGHT, CARD_WIDTH, DISCARD_X, DISCARD_Y, playerSide } from './SanLayout'
import { PlayerResourceCounters } from '../material/PlayerResourceCounters'

/** A Corporation's face-up discard pile, lying on its side past its own Virus pile. */
class DiscardLocator extends DeckLocator {
  limit = 30

  getCoordinates(location: Location, context: MaterialContext) {
    return { x: DISCARD_X, y: DISCARD_Y * playerSide(location.player!, context) }
  }

  /**
   * The cards are turned, not the location: its box is given the footprint of a card on its side
   * instead, so that the resource counters it holds read upright.
   */
  getItemRotateZ(_item: MaterialItem, _context: ItemContext) {
    return 90
  }

  /**
   * One static location per Corporation, always present — unlike the real Discard, which starts (and
   * can stay) empty — so the per-turn resource counters (see PlayerResourceCounters) always have the
   * pile's own spot to render next to, whether or not it holds any card yet.
   */
  locations = [{ player: Corporation.Moon }, { player: Corporation.Star }]
  locationDescription = new DiscardCountersLocationDescription()
}

class DiscardCountersLocationDescription extends LocationDescription {
  width = CARD_HEIGHT
  height = CARD_WIDTH
  content = PlayerResourceCounters
}

export const discardLocator = new DiscardLocator()
