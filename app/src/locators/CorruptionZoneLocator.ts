import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { CORRUPTION_STACK_GAP, CORRUPTION_Y, playerSide, riverX } from './SanLayout'

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
}

export const corruptionZoneLocator = new CorruptionZoneLocator()
