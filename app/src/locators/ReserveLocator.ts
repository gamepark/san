import { DeckLocator } from '@gamepark/react-game'
import { LocationType } from '@gamepark/san/material/LocationType'
import { reserveCounterDescription } from '../material/PileCounter'
import { RESERVE_X, RESERVE_Y } from './SanLayout'

/** The Reserve pile, used to refill the River, left of it: face down except its top card. */
class ReserveLocator extends DeckLocator {
  coordinates = { x: RESERVE_X, y: RESERVE_Y }
  /** No browsing through the pile in the help dialog: only its top card is face up. */
  navigationSorts = []
  /** A static spot for the count of cards left in the Reserve (see PileCounter). */
  location = { type: LocationType.Reserve }
  locationDescription = reserveCounterDescription
}

export const reserveLocator = new ReserveLocator()
