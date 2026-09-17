import { DropAreaDescription, ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { isMoveItemType, Location, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Corporation } from '@gamepark/san/Corporation'
import { virusCardChips } from '@gamepark/san/material/constants'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanCard, virusNumber } from '@gamepark/san/material/SanCard'
import { PlayCardsRule } from '@gamepark/san/rules/PlayCardsRule'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { VIRUS_TRACK_X } from './SanLayout'
import { virusPileLocator, virusPileRotation } from './VirusPileLocator'

/**
 * Offsets (in cm) of each printed "case d'avancement" from the CENTRE of the Virus card, measured on
 * the artwork as printed (card upright). Keyed by the number of the card on top of the pile; the array
 * is ordered `k = 1 … N` where `k = 1` is the space nearest the Central Port and `k = N` the one
 * nearest the pile (the order the pawn crosses them). Lengths are `8 − number` (Virus 5 → 3 spaces,
 * Virus 1 → 7). Moon and Star cards share the same layout.
 *
 * The pile is drawn upright or upside down ({@link virusPileRotation}), so each offset is turned with
 * it — see {@link VirusTrackLocator.getCoordinates}.
 */
const CHIPS: Record<number, { dx: number; dy: number }[]> = {
  5: [
    { dx: -1, dy: 0.9 },
    { dx: -0.8, dy: -2.9 },
    { dx: 1.5, dy: -0.5 }
  ],
  4: [
    { dx: -1.5, dy: 3 },
    { dx: -1.5, dy: -1 },
    { dx: 1.5, dy: -2.5 },
    { dx: 1.3, dy: 1.7 }
  ],
  3: [
    { dx: -1, dy: 1 },
    { dx: -1.5, dy: -1 },
    { dx: 1.5, dy: -2.3 },
    { dx: 1.8, dy: -0.5 },
    { dx: 1.2, dy: 1.5 }
  ],
  2: [
    { dx: -1, dy: 1 },
    { dx: -1.5, dy: -1 },
    { dx: -0.7, dy: -3 },
    { dx: 1.5, dy: -2.5 },
    { dx: 1.7, dy: -0.5 },
    { dx: 1.2, dy: 1.5 }
  ],
  1: [
    { dx: -1.3, dy: 2.8 },
    { dx: -1, dy: 0.9 },
    { dx: -1.5, dy: -1 },
    { dx: -0.7, dy: -3 },
    { dx: 1.5, dy: -2.5 },
    { dx: 1.7, dy: -0.5 },
    { dx: 1.2, dy: 1.5 }
  ]
}

/**
 * Position of the Virus pawn along the Virus track.
 *
 * `location.x` is the signed step from the Central Port (0): positive steps are on the Star's Virus
 * pile, negative on the Moon's — whichever side of the Central Port each is displayed on. `|step|` is the advancement-space number (1 = next to the Central Port) on that
 * Corporation's *current* top Virus card, whose count is `8 − topCardNumber` ({@link virusCardChips}).
 * Each space is placed from {@link CHIPS}.
 */
class VirusTrackLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const step = location.x ?? 0
    if (step === 0) {
      return { x: VIRUS_TRACK_X, y: 0, z: 2 }
    }
    const corporation = step > 0 ? Corporation.Star : Corporation.Moon // whose Virus pile the space is printed on
    const cards = context.rules.material(MaterialType.Card).location(LocationType.VirusPile).player(corporation).length
    // The spaces are printed on the card on top of the pile, which the pile shifts a little off its base.
    const pile = { type: LocationType.VirusPile, player: corporation, x: Math.max(0, cards - 1) }
    const top = virusPileLocator.getLocationCoordinates(pile, context)
    const chips = this.topVirusChips(context, corporation)
    const chip = CHIPS[8 - chips]?.[Math.abs(step) - 1] ?? { dx: 0, dy: 0 } // keyed by the number printed on the top card
    const turn = virusPileRotation(pile, context) === 180 ? -1 : 1
    return {
      x: (top.x ?? 0) + turn * chip.dx,
      y: (top.y ?? 0) + turn * chip.dy,
      z: 2
    }
  }

  /**
   * The spaces the pawn can be clicked to directly on its own turn — reuses {@link PlayCardsRule.virusMoves}
   * so this stays in sync with the actual legal moves rather than duplicating that logic.
   */
  getLocations(context: MaterialContext): Partial<Location>[] {
    if (context.rules.game.rule?.player !== context.player || context.rules.game.rule?.id !== RuleId.PlayCards) return []
    return new PlayCardsRule(context.rules.game)
      .virusMoves()
      .filter(isMoveItemType(MaterialType.VirusPawn))
      .map((move) => move.location)
  }

  /** Standable advancement spaces on a Corporation's current top Virus card (0 if its pile is empty, matching {@link SanRule.virusChips}). */
  private topVirusChips(context: MaterialContext, corporation: Corporation): number {
    const numbers = context.rules
      .material(MaterialType.Card)
      .location(LocationType.VirusPile)
      .player(corporation)
      .getItems<SanCard>()
      .map((item) => virusNumber(item.id))
    return numbers.length ? virusCardChips(Math.max(...numbers)) : 0
  }

  /** The pawn is a standee: it keeps a fixed orientation and never follows the board's half-turn. */
  getRotateZ() {
    return 0
  }

  /**
   * The pawn art is a standee whose foot is at the bottom of the image. Raise it by (almost) half its
   * height so the foot — not the image centre — sits on the advancement-space chip. Tune the % to
   * drop it exactly on the square.
   */
  placeItem(item: MaterialItem, context: ItemContext): string[] {
    return super.placeItem(item, context).concat('translateY(-42%)')
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return {
      moon: this.topVirusChips(context, Corporation.Moon),
      star: this.topVirusChips(context, Corporation.Star)
    }
  }

  /** The drop zone is a small square, like a "case d'avancement" chip on the card, not the pawn shape. */
  locationDescription = new VirusTrackDropDescription()
}

class VirusTrackDropDescription extends DropAreaDescription {
  width = 1.9
  height = 1.9
  borderRadius = 0.2

  canShortClick(move: MaterialMove, location: Location): boolean {
    return (
      isMoveItemType(MaterialType.VirusPawn)(move) &&
      move.location.type === LocationType.VirusTrack &&
      move.location.x === location.x
    )
  }
}

export const virusTrackLocator = new VirusTrackLocator()
