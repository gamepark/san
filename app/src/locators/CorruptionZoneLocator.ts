import { DropAreaDescription, LocationContext, Locator, MaterialContext } from '@gamepark/react-game'
import { isMoveItemType, Location, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { PlayCardsRule } from '@gamepark/san/rules/PlayCardsRule'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { CARD_BORDER_RADIUS, CARD_HEIGHT, CARD_WIDTH, CORRUPTION_STACK_GAP, CORRUPTION_Y, HAND_Z, playerSide, riverX } from './SanLayout'

/**
 * A Corporation's Corruption zone: 6 slots (location.x = 0..5), each in the same column as the River
 * card it corrupts, holding up to 2 face-down cards stacked with a small offset (location.y = 0 or 1)
 * towards the Corporation's edge of the table. The far Corporation's cards are turned half a turn, so
 * that for both the top of the card — its -1/+1 corners — faces the River and reads the same way.
 */
class CorruptionZoneLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const stack = location.y ?? 0
    return {
      x: riverX(location.x ?? 0, context),
      y: (CORRUPTION_Y + stack * CORRUPTION_STACK_GAP) * playerSide(location.player!, context),
      z: stack * 0.05
    }
  }

  getRotateZ(location: Location, context: MaterialContext) {
    return playerSide(location.player!, context) === 1 ? 0 : 180
  }

  /**
   * The slots the card selected with its "Corrompre" button (see
   * {@link import('../material/SanCardDescription').SanCardDescription.getItemMenu}) can be corrupted to, so
   * that a click on one of them sends it there. Reuses {@link PlayCardsRule.corruptionMoves} and
   * {@link PlayCardsRule.corruptFromHandMoves} to stay in sync with the legal moves.
   */
  getLocations(context: MaterialContext): Partial<Location>[] {
    if (context.rules.game.rule?.player !== context.player || context.rules.game.rule?.id !== RuleId.PlayCards) return []
    const selected = context.rules.material(MaterialType.Card).selected().getIndexes()
    if (!selected.length) return []
    const rule = new PlayCardsRule(context.rules.game)
    return [...rule.corruptionMoves(), ...rule.corruptFromHandMoves()]
      .filter(isMoveItemType(MaterialType.Card))
      .filter((move) => selected.includes(move.itemIndex))
      .map((move) => move.location)
  }

  locationDescription = new CorruptionSlotDescription()
}

class CorruptionSlotDescription extends DropAreaDescription {
  width = CARD_WIDTH
  height = CARD_HEIGHT
  borderRadius = CARD_BORDER_RADIUS

  /** The hand is drawn over most of the slots (see {@link import('./SanLayout').HAND_Y}): lift the areas above it, so they can be clicked. */
  getLocationTransform(location: Location, context: LocationContext): string[] {
    return [...super.getLocationTransform(location, context), `translateZ(${HAND_Z + 0.1}em)`]
  }

  /** Only the selected card goes there on a click: several cards may be corruptible to the same slot. */
  canShortClick(move: MaterialMove, location: Location, context: MaterialContext): boolean {
    return (
      isMoveItemType(MaterialType.Card)(move) &&
      move.location.type === LocationType.CorruptionZone &&
      move.location.x === location.x &&
      move.location.y === location.y &&
      context.rules.material(MaterialType.Card).getItem(move.itemIndex).selected === true
    )
  }
}

export const corruptionZoneLocator = new CorruptionZoneLocator()
