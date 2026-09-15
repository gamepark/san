import { MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { Corporation } from '../../Corporation'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { EMPTY_RESOURCES, Memory, ResourcesMemory } from '../Memory'

/** Resources spendable through the shared "any resource" (flex) pool — coins are not. */
type SpendableResourceKey = 'corruption' | 'propaganda' | 'virus'

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

  /** "Any resource" points, usable as Corruption, Propaganda or Virus (see {@link ResourcesMemory.flex}). */
  flexPoints(player = this.player): number {
    return this.points('flex', player)
  }

  addFlexPoints(amount: number) {
    this.addPoints('flex', amount)
  }

  /** Points available for a resource action: its own counter plus the shared "any resource" pool. */
  spendable(key: SpendableResourceKey, player = this.player): number {
    return this.points(key, player) + this.flexPoints(player)
  }

  /**
   * Pay `cost` of a resource: spend that resource's own counter first, then take only the shortfall
   * from the shared "any resource" pool ({@link ResourcesMemory.flex}). Each pool is simply
   * decremented by what it covers — unused points are lost at the end of the turn, not the moment a
   * pool is first tapped. So three "gain any resource" cards give three points that can be split
   * between Virus / Propaganda / Corruption actions.
   */
  spend(key: SpendableResourceKey, cost: number) {
    const owned = this.points(key)
    const fromFlex = Math.max(0, cost - owned)
    this.memorize<ResourcesMemory>(
      Memory.Resources,
      (r) => {
        const base = r ?? EMPTY_RESOURCES
        return { ...base, [key]: Math.max(0, base[key] - cost), flex: Math.max(0, base.flex - fromFlex) }
      },
      this.player
    )
  }

  /** Spend `cost` coins (buying a River card): unlike {@link spend}, never dips into the flex pool. */
  spendCoins(cost: number) {
    this.memorize<ResourcesMemory>(
      Memory.Resources,
      (r) => ({ ...(r ?? EMPTY_RESOURCES), coins: Math.max(0, (r ?? EMPTY_RESOURCES).coins - cost) }),
      this.player
    )
  }
}
