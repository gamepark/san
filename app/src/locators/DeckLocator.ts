import { DeckLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { Corporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { deckCounterDescription } from '../material/PileCounter'
import { DECK_X, DECK_Y, playerSide } from './SanLayout'

/** A Corporation's face-down draw pile, on its side of the Reserve; the opponent's is turned towards them. */
class PlayerDeckLocator extends DeckLocator {
  limit = 12

  /** One static spot per Corporation, for the count of cards left in its Deck (see PileCounter). */
  locations = [
    { type: LocationType.Deck, player: Corporation.Moon },
    { type: LocationType.Deck, player: Corporation.Star }
  ]
  locationDescription = deckCounterDescription

  getCoordinates(location: Location, context: MaterialContext) {
    return { x: DECK_X, y: DECK_Y * playerSide(location.player!, context) }
  }

  getRotateZ(location: Location, context: MaterialContext) {
    return playerSide(location.player!, context) === 1 ? 0 : 180
  }
}

export const playerDeckLocator = new PlayerDeckLocator()
