import { MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { Corporation } from '../../Corporation'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { EMPTY_RESOURCES, Memory, ResourcesMemory } from '../Memory'

/** Reads and updates one player's per-turn resource counters (see {@link ResourcesMemory}). */
export class ResourcesHelper extends MaterialRulesPart<Corporation, MaterialType, LocationType> {
  constructor(
    game: MaterialGame<Corporation, MaterialType, LocationType>,
    private player: Corporation
  ) {
    super(game)
  }

  /** The counters stored in memory (from {@link reset} to {@link clear}): mutate them directly to gain or spend points. */
  get resources(): ResourcesMemory {
    return this.remind<ResourcesMemory>(Memory.Resources, this.player)
  }

  /** Start the turn with empty counters. */
  reset() {
    this.memorize<ResourcesMemory>(Memory.Resources, { ...EMPTY_RESOURCES }, this.player)
  }

  /** Unspent resources are lost at end of turn: the player panel then shows none. */
  clear() {
    this.forget(Memory.Resources, this.player)
  }
}
