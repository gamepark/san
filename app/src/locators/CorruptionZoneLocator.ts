import { Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { boardFlip, boardFlipRotation, CORRUPTION_STACK_GAP, CORRUPTION_Y, corruptionSlotX, fixedSide } from './SanLayout'

/**
 * A Corporation's Corruption zone: 6 slots along a row (location.x = 0..5), each holding up to 2
 * face-down cards stacked with a small offset (location.y = 0 or 1). Sits on the Corporation's
 * permanent side, turned a half-turn with the rest of the board for a Moon viewer.
 */
class CorruptionZoneLocator extends Locator {
  getCoordinates(location: Location, context: MaterialContext) {
    const f = boardFlip(context)
    const s = fixedSide(location.player!) * f
    const slot = location.x ?? 0
    const stack = location.y ?? 0
    return {
      x: corruptionSlotX(slot) * f,
      y: (CORRUPTION_Y + stack * CORRUPTION_STACK_GAP) * s,
      z: stack * 0.05
    }
  }

  getRotateZ(_location: Location, context: MaterialContext) {
    return boardFlipRotation(context)
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { viewer: context.player }
  }
}

export const corruptionZoneLocator = new CorruptionZoneLocator()
