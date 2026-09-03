import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { CORRUPTION_STACK_GAP, CORRUPTION_Y, corruptionSlotX, fixedSide } from './SanLayout'

/**
 * A Corporation's Corruption zone: 6 slots along a row (location.x = 0..5), each holding up to 2
 * face-down cards stacked with a small offset (location.y = 0 or 1). Sits on the Corporation's
 * permanent side, so it never moves when the viewing player switches.
 */
class CorruptionZoneLocator extends Locator {
  getCoordinates(location: Location, _context: MaterialContext) {
    const s = fixedSide(location.player!)
    const slot = location.x ?? 0
    const stack = location.y ?? 0
    return {
      x: corruptionSlotX(slot),
      y: (CORRUPTION_Y + stack * CORRUPTION_STACK_GAP) * s,
      z: stack * 0.05
    }
  }
}

export const corruptionZoneLocator = new CorruptionZoneLocator()
