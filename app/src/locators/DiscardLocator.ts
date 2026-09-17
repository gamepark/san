import { DeckLocator, DropAreaDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Corporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { CARD_BORDER_RADIUS, CARD_HEIGHT, CARD_WIDTH, DISCARD_X, DISCARD_Y, playerSide } from './SanLayout'
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
   * pile's own spot to render next to, whether or not it holds any card yet. It is also the drop zone of
   * every move to the Discard (buying a River card, discarding a Virus card), even while the pile is empty.
   * The type is spelled out: the framework would otherwise fill it from the locators' key, a string, and
   * no longer recognise this spot as the drop target of a move, then render a second one.
   */
  locations = [
    { type: LocationType.Discard, player: Corporation.Moon },
    { type: LocationType.Discard, player: Corporation.Star }
  ]
  locationDescription = new DiscardCountersLocationDescription()
}

class DiscardCountersLocationDescription extends DropAreaDescription {
  width = CARD_HEIGHT
  height = CARD_WIDTH
  borderRadius = CARD_BORDER_RADIUS
  content = PlayerResourceCounters

  /** Dragging only: a long press on the pile would otherwise buy or discard whichever card happens to be the only candidate. */
  canLongClick(_move: MaterialMove, _location: Location, _context: MaterialContext) {
    return false
  }
}

export const discardLocator = new DiscardLocator()
