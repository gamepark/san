import { Locator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { CENTRE_Y, CORRUPTION_STACK_GAP, CORRUPTION_Y, fixedSide, riverX } from './SanLayout'

/**
 * A Corporation's Corruption zone: 6 slots (location.x = 0..5), each in the same column as the River
 * card it corrupts, holding up to 2 face-down cards stacked with a small offset (location.y = 0 or 1).
 * Sits above the River for Moon and below it for Star (`fixedSide`).
 */
class CorruptionZoneLocator extends Locator {
  getCoordinates(location: Location) {
    const s = fixedSide(location.player!)
    const slot = location.x ?? 0
    const stack = location.y ?? 0
    return {
      x: riverX(slot),
      y: CENTRE_Y + (CORRUPTION_Y + stack * CORRUPTION_STACK_GAP) * s,
      z: stack * 0.05
    }
  }
}

export const corruptionZoneLocator = new CorruptionZoneLocator()
