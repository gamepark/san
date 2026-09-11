import { MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { Corporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CardEffect, EffectType, getCardData, isMercenaryType } from '../material/CardsData'
import { virusCardChips } from '../material/constants'
import { CardType, SanCard, virusNumber } from '../material/SanCard'
import { clone } from './clone'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

/**
 * Shared helpers for every rule of a player turn: access to the player's piles, to the effect queue
 * of the card currently being played, and to the per-turn resource counters.
 */
export abstract class SanRule extends PlayerTurnRule<Corporation, MaterialType, LocationType> {
  get hand() {
    return this.material(MaterialType.Card).location(LocationType.Hand).player(this.player)
  }

  get playArea() {
    return this.material(MaterialType.Card).location(LocationType.PlayArea).player(this.player)
  }

  get discard() {
    return this.material(MaterialType.Card).location(LocationType.Discard).player(this.player)
  }

  get deck() {
    return this.material(MaterialType.Card).location(LocationType.Deck).player(this.player)
  }

  get river() {
    return this.material(MaterialType.Card).location(LocationType.River)
  }

  /** A Corporation's stack of Virus cards, still on the board (driven-off cards leave for its deck). */
  virusPile(player: Corporation) {
    return this.material(MaterialType.Card).location(LocationType.VirusPile).player(player)
  }

  /** The other Corporation (the one the active player attacks along the Virus track). */
  get virusOpponent(): Corporation {
    return this.player === Corporation.Moon ? Corporation.Star : Corporation.Moon
  }

  /** Highest Virus number still on a Corporation's pile (5 at setup, 0 once every card is driven off). */
  topVirusNumber(player: Corporation): number {
    const numbers = this.virusPile(player).getItems<SanCard>().map((item) => virusNumber(item.id))
    return numbers.length ? Math.max(...numbers) : 0
  }

  /** Standable advancement spaces on a Corporation's current top Virus card (0 if its pile is empty). */
  virusChips(player: Corporation): number {
    const top = this.topVirusNumber(player)
    return top === 0 ? 0 : virusCardChips(top)
  }

  get reserve() {
    return this.material(MaterialType.Card).location(LocationType.Reserve)
  }

  /** The effects still to resolve for the card being played, front first. */
  get effectQueue(): CardEffect[] {
    return this.remind<CardEffect[]>(Memory.PendingEffects) ?? []
  }

  setQueue(queue: CardEffect[]) {
    this.memorize(Memory.PendingEffects, queue)
  }

  /** Drop the effect currently being handled and go back to the effect dispatcher. */
  finishCurrentEffect(): MaterialMove[] {
    const queue = this.effectQueue
    queue.shift()
    this.setQueue(queue)
    return [this.startRule(RuleId.ResolveEffects)]
  }

  /** Add `amount` to one of the per-player resource counters. */
  addPoints(key: Memory.CorruptionPoints | Memory.PropagandaPoints | Memory.VirusPoints | Memory.Coins, amount: number) {
    this.memorize<number>(key, (value) => (value ?? 0) + amount, this.player)
  }

  points(key: Memory.CorruptionPoints | Memory.PropagandaPoints | Memory.VirusPoints | Memory.Coins, player = this.player): number {
    return this.remind<number>(key, player) ?? 0
  }

  /** "Any resource" points, usable as Corruption, Propaganda or Virus (see {@link Memory.FlexPoints}). */
  flexPoints(player = this.player): number {
    return this.remind<number>(Memory.FlexPoints, player) ?? 0
  }

  addFlexPoints(amount: number) {
    this.memorize<number>(Memory.FlexPoints, (value) => (value ?? 0) + amount, this.player)
  }

  /** Points available for a resource action: its own counter plus the shared "any resource" pool. */
  spendableResource(key: Memory.CorruptionPoints | Memory.PropagandaPoints | Memory.VirusPoints, player = this.player): number {
    return this.points(key, player) + this.flexPoints(player)
  }

  /**
   * Pay `cost` of a resource: spend that resource's own counter first, then take only the shortfall
   * from the shared "any resource" pool ({@link Memory.FlexPoints}). Each pool is simply decremented
   * by what it covers — unused points are lost at the end of the turn, not the moment a pool is
   * first tapped. So three "gain any resource" cards give three points that can be split between
   * Virus / Propaganda / Corruption actions.
   */
  spendResource(key: Memory.CorruptionPoints | Memory.PropagandaPoints | Memory.VirusPoints, cost: number) {
    const owned = this.points(key)
    this.memorize<number>(key, Math.max(0, owned - cost), this.player)
    const fromFlex = cost - owned
    if (fromFlex > 0) {
      this.memorize<number>(Memory.FlexPoints, (value) => Math.max(0, (value ?? 0) - fromFlex), this.player)
    }
  }

  /** Whether a Mercenary card of that type may still be played this turn. */
  mercenaryTypePlayable(type: CardType): boolean {
    if (this.remind(Memory.AllTypesAllowed)) return true
    const played = this.remind<CardType | undefined>(Memory.PlayedMercenaryType)
    return played === undefined || played === type
  }

  /**
   * Register a card that just entered the play area: bank its revenue, lock the Mercenary type,
   * flag it for the box if it is Single Use, then queue its effects for resolution.
   */
  playCardEffects(itemIndex: number): MaterialMove[] {
    this.memorize(Memory.CardPlayed, true)
    const id = this.material(MaterialType.Card).getItem<SanCard>(itemIndex).id
    const data = getCardData(id)
    if (!data) return [this.startRule(RuleId.ResolveEffects)]

    if (data.revenue) this.addPoints(Memory.Coins, data.revenue)
    if (isMercenaryType(data.type) && !this.remind(Memory.AllTypesAllowed) && this.remind(Memory.PlayedMercenaryType) === undefined) {
      this.memorize(Memory.PlayedMercenaryType, data.type)
    }
    this.memorize(Memory.ResolvingCardIndex, itemIndex)

    const effects = clone(data.effects)
    if (effects.some((effect) => effect.type === EffectType.SingleUse)) {
      this.memorize<number[]>(Memory.SingleUseCards, (list) => [...(list ?? []), itemIndex])
    }
    const queue = this.effectQueue
    queue.unshift(...effects)
    this.setQueue(queue)
    return [this.startRule(RuleId.ResolveEffects)]
  }

  /** Positions of the Corruption zone still able to receive a card, as {@link LocationType.CorruptionZone} coordinates. */
  freeCorruptionPositions(player = this.player): { x: number; y: number }[] {
    const zone = this.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player)
    const positions: { x: number; y: number }[] = []
    for (let x = 0; x < 6; x++) {
      const filled = zone.filter((item) => item.location.x === x).length
      if (filled < 2) positions.push({ x, y: filled })
    }
    return positions
  }
}
