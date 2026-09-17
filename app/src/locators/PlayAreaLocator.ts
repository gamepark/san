import { DropAreaDescription, ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { CARD_BORDER_RADIUS, CARD_WIDTH, PLAY_AREA_DROP_HEIGHT, PLAY_AREA_MAX_COUNT, PLAY_AREA_STACK_GAP, PLAY_AREA_X, playerSide, VIRUS_PILE_Y } from './SanLayout'

/**
 * Cards played this turn, right of the Central Port. The players never play at the same time, so both
 * share this one spot, and the first card played lies level with the player's own Virus pile.
 *
 * Each card covers the lower part of the one played before it, leaving its top strip in sight. For the
 * opponent, at the top, the stack grows downwards: the cards already played stay where they are. For
 * the player, at the bottom, the last card played takes the first one's place, level with the Virus
 * pile, and pushes the others up. Past {@link PLAY_AREA_MAX_COUNT} cards the stack closes ranks
 * rather than running off the table.
 */
class PlayAreaLocator extends ListLocator {
  gap = { y: PLAY_AREA_STACK_GAP }
  maxCount = PLAY_AREA_MAX_COUNT

  getCoordinates(location: Location, context: MaterialContext) {
    const side = playerSide(location.player!, context)
    const y = VIRUS_PILE_Y * side
    return { x: PLAY_AREA_X, y: side === 1 ? y - this.stackHeight(location, context) : y }
  }

  /** From the first card to the last: the gap, tightened past {@link maxCount}, as {@link ListLocator} places them. */
  private stackHeight(location: Location, context: MaterialContext) {
    const count = this.countListItems(location, context)
    if (count <= 1) return 0
    return Math.min(PLAY_AREA_STACK_GAP * (count - 1), PLAY_AREA_STACK_GAP * (PLAY_AREA_MAX_COUNT - 1))
  }

  /** The drop zone is a column centred on the Central Port. */
  getAreaCoordinates() {
    return { x: PLAY_AREA_X, y: 0 }
  }

  /** A fixed column, about as tall as the two Virus piles and the Central Port between them. */
  locationDescription = new DropAreaDescription({ width: CARD_WIDTH, height: PLAY_AREA_DROP_HEIGHT, borderRadius: CARD_BORDER_RADIUS })
}

export const playAreaLocator = new PlayAreaLocator()
