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

  /** The counters stored in memory: mutate them directly to gain or spend points. */
  get resources(): ResourcesMemory {
    const stored = this.remind<ResourcesMemory | undefined>(Memory.Resources, this.player)
    if (stored && Object.keys(EMPTY_RESOURCES).every((key) => key in stored)) return stored
    // Merged over EMPTY_RESOURCES so a counter added after a game was started reads 0, not undefined.
    return this.memorize<ResourcesMemory>(Memory.Resources, { ...EMPTY_RESOURCES, ...stored }, this.player)
  }

  reset(player = this.player) {
    this.memorize<ResourcesMemory>(Memory.Resources, { ...EMPTY_RESOURCES }, player)
  }
}
