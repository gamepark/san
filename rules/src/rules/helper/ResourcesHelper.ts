import { MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { Corporation } from '../../Corporation'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { EMPTY_RESOURCES, Memory, ResourcesMemory } from '../Memory'

/** A counter spendable through {@link ResourcesHelper.spend} — coins have their own {@link ResourcesHelper.spendCoins}. */
type SpendableResourceKey = Exclude<keyof ResourcesMemory, 'coins'>

/** Reads and spends one player's per-turn resource counters (see {@link ResourcesMemory}). */
export class ResourcesHelper extends MaterialRulesPart<Corporation, MaterialType, LocationType> {
  constructor(
    game: MaterialGame<Corporation, MaterialType, LocationType>,
    private player: Corporation
  ) {
    super(game)
  }

  resources(player = this.player): ResourcesMemory {
    return this.remind<ResourcesMemory>(Memory.Resources, player) ?? EMPTY_RESOURCES
  }

  reset(player = this.player) {
    this.memorize(Memory.Resources, EMPTY_RESOURCES, player)
  }

  /** Add `amount` to one of the per-player resource counters. */
  addPoints(key: keyof ResourcesMemory, amount: number) {
    this.memorize<ResourcesMemory>(
      Memory.Resources,
      (r) => ({ ...(r ?? EMPTY_RESOURCES), [key]: (r ?? EMPTY_RESOURCES)[key] + amount }),
      this.player
    )
  }

  points(key: keyof ResourcesMemory, player = this.player): number {
    return this.resources(player)[key]
  }

  /** Spend `cost` (1 by default) of a banked counter; unused points are simply lost at end of turn. */
  spend(key: SpendableResourceKey, cost = 1) {
    this.memorize<ResourcesMemory>(
      Memory.Resources,
      (r) => {
        const base = r ?? EMPTY_RESOURCES
        return { ...base, [key]: Math.max(0, base[key] - cost) }
      },
      this.player
    )
  }

  /** Spend `cost` coins (buying a River card). */
  spendCoins(cost: number) {
    this.memorize<ResourcesMemory>(
      Memory.Resources,
      (r) => ({ ...(r ?? EMPTY_RESOURCES), coins: Math.max(0, (r ?? EMPTY_RESOURCES).coins - cost) }),
      this.player
    )
  }
}
