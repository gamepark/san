import { ListLocator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { cornerSide, DECK_X, PLAY_AREA_STACK_GAP, PLAY_AREA_Y } from './SanLayout'

/**
 * Cards a Corporation has played in front of itself this turn, climbing in a stack just above its
 * Deck. Each new card slides slightly behind the ones already there (the `z` step in {@link getGap}
 * is negative) — same technique as Odysseus's `PlayerAdventureColumnLocator` and Dragon Bomb's
 * `PlayerCapturedDragonLocator`: the first card played stays fully visible on top, and every card
 * played after it only pokes its own top edge out above the stack.
 */
class PlayAreaLocator extends ListLocator {
  getCoordinates(location: Location) {
    return { x: cornerSide(location.player!) * DECK_X, y: PLAY_AREA_Y }
  }

  getGap() {
    return { y: -PLAY_AREA_STACK_GAP, z: -0.01 }
  }
}

export const playAreaLocator = new PlayAreaLocator()
