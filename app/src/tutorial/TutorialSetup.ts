import { Corporation } from '@gamepark/san/Corporation'
import { HAND_SIZE, RIVER_SIZE } from '@gamepark/san/material/constants'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { getCardCopies, riverCards, SanCard } from '@gamepark/san/material/SanCard'
import { SanSetup } from '@gamepark/san/SanSetup'

/**
 * Moon is the Corporation a local tab plays by default: the player must be it, or the tab would watch the opponent's
 * side while the tutorial plays the player's moves on its own. Displayed at the bottom, Moon sees the River mirrored
 * (see SanLayout.riverDirection): its banner starts on the left, facing River card x = 5.
 */
export const me = Corporation.Moon
export const opponent = Corporation.Star

/**
 * The River column the player's banner crosses first: the leftmost one on screen. Its Equipment costs 4 to cross, 3 once the
 * player has corrupted a card under it on the first turn — exactly what their 3 Propaganda cards give on the second.
 */
export const FIRST_CROSSING_X = RIVER_SIZE - 1
/** The card the player corrupts on the first turn: the rightmost one on screen. */
export const CORRUPTED_X = 0

/**
 * Scripted River. The first card must not be affordable with 3 coins (it would leave the River otherwise); the three
 * in the middle can be, so that each player can buy one. The remaining slot is dealt at random.
 */
const river: { x: number; id: SanCard }[] = [
  { x: FIRST_CROSSING_X, id: SanCard.RiverEquipment5 },
  { x: 3, id: SanCard.RiverCorruption1 },
  { x: 2, id: SanCard.RiverHacking3 },
  { x: 1, id: SanCard.RiverPropaganda2 },
  { x: CORRUPTED_X, id: SanCard.RiverPropaganda5 }
]

/**
 * Scripted opening:
 * - the player (Moon) starts, with 2 Corruption, 1 Equipment and 3 Propaganda cards: 3 Corruption symbols on the
 *   first turn, then 3 Propaganda symbols on the second;
 * - the opponent (Star) gets 2 Hacking and 1 Equipment cards: 3 Hacking symbols, enough to drive the player's Virus 5
 *   card off, since the Virus pawn starts on its first space;
 * - everything else is random.
 */
export class TutorialSetup extends SanSetup {
  setupDecks(handSize: number) {
    super.setupDecks(handSize)
    this.prepareHand(me, [
      SanCard.MoonCorruption,
      SanCard.MoonCorruption,
      SanCard.MoonEquipment,
      SanCard.MoonPropaganda,
      SanCard.MoonPropaganda,
      SanCard.MoonPropaganda
    ])
    this.prepareHand(opponent, [SanCard.StarHacking, SanCard.StarHacking, SanCard.StarEquipment])
  }

  /** Put the hand back into the deck, take the scripted cards, then complete the hand at random. */
  prepareHand(player: Corporation, cards: SanCard[]) {
    const deck = () => this.material(MaterialType.Card).location(LocationType.Deck).player(player)
    this.material(MaterialType.Card).location(LocationType.Hand).player(player).moveItems({ type: LocationType.Deck, player })
    for (const id of cards) {
      deck().id(id).limit(1).moveItems({ type: LocationType.Hand, player })
    }
    deck().shuffle()
    deck().deck().deal({ type: LocationType.Hand, player }, HAND_SIZE - cards.length)
  }

  setupRiverAndReserve() {
    const reserve = () => this.material(MaterialType.Card).location(LocationType.Reserve)
    this.material(MaterialType.Card).createItems(
      riverCards.flatMap((id) => Array<SanCard>(getCardCopies(id)).fill(id)).map((id) => ({ id, location: { type: LocationType.Reserve } }))
    )
    for (const { x, id } of river) {
      reserve().id(id).limit(1).moveItems({ type: LocationType.River, x })
    }
    reserve().shuffle()
    reserve().deck().deal({ type: LocationType.River }, RIVER_SIZE - river.length)
    reserve().deck().limit(1).rotateItem(true)
  }

  determineStartingPlayer(): Corporation {
    return me
  }
}
