import { MaterialRulesPart } from '@gamepark/rules-api'
import { Corporation } from '../../Corporation'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { CardType } from '../../material/SanCard'
import { EMPTY_TURN_FLAGS, Memory, TurnFlagsMemory } from '../Memory'

/** Reads and updates the current turn's flags/markers (see {@link TurnFlagsMemory}). */
export class TurnFlagsHelper extends MaterialRulesPart<Corporation, MaterialType, LocationType> {
  get flags(): TurnFlagsMemory {
    return this.remind<TurnFlagsMemory>(Memory.TurnFlags) ?? EMPTY_TURN_FLAGS
  }

  reset() {
    this.forget(Memory.TurnFlags)
  }

  /** Whether a Mercenary card of that type may still be played this turn. */
  mercenaryTypePlayable(type: CardType): boolean {
    const flags = this.flags
    return flags.allTypesAllowed || flags.playedMercenaryType === undefined || flags.playedMercenaryType === type
  }

  /**
   * Lock the turn to this Mercenary type — unless it's already locked (only the first Mercenary
   * played or copied counts) or lifted by "play every type you want".
   */
  lockMercenaryType(type: CardType) {
    this.memorize<TurnFlagsMemory>(Memory.TurnFlags, (f) => {
      const base = f ?? EMPTY_TURN_FLAGS
      return base.allTypesAllowed || base.playedMercenaryType !== undefined ? base : { ...base, playedMercenaryType: type }
    })
  }

  setCardPlayed() {
    this.memorize<TurnFlagsMemory>(Memory.TurnFlags, (f) => ({ ...(f ?? EMPTY_TURN_FLAGS), cardPlayed: true }))
  }

  setAllTypesAllowed() {
    this.memorize<TurnFlagsMemory>(Memory.TurnFlags, (f) => ({ ...(f ?? EMPTY_TURN_FLAGS), allTypesAllowed: true }))
  }

  /** Flag an item to be removed from the game (the box), not discarded, at end of turn. */
  addSingleUseCard(itemIndex: number) {
    this.memorize<TurnFlagsMemory>(Memory.TurnFlags, (f) => {
      const base = f ?? EMPTY_TURN_FLAGS
      return { ...base, singleUseCards: [...base.singleUseCards, itemIndex] }
    })
  }
}
