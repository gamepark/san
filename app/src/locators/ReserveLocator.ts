import { DeckLocator, LocationDescription } from '@gamepark/react-game'
import { CARD_HEIGHT, CARD_WIDTH, RESERVE_X, RESERVE_Y } from './SanLayout'
import { ReserveCountBadge } from '../material/ReserveCountBadge'

/** The face-up Reserve pile, used to refill the River. */
class ReserveLocator extends DeckLocator {
  limit = 30

  getCoordinates() {
    return { x: RESERVE_X, y: RESERVE_Y }
  }

  /**
   * A single static location, always present (unlike the real Reserve, which can empty and ends the
   * game when it does), so the remaining-cards counter always has the pile's own spot — see
   * ReserveCountBadge.
   */
  locations = [{}]
  locationDescription = new ReserveCountLocationDescription()
}

class ReserveCountLocationDescription extends LocationDescription {
  width = CARD_WIDTH
  height = CARD_HEIGHT
  content = ReserveCountBadge
}

export const reserveLocator = new ReserveLocator()
