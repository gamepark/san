import { MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { Corporation, otherCorporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CardEffect, EffectType, getCardData, isMercenaryType } from '../material/CardsData'
import { CORRUPTION_SLOT_CAPACITY, CORRUPTION_SLOTS, virusCardChips } from '../material/constants'
import { SanCard, virusNumber } from '../material/SanCard'
import { clone } from './clone'
import { ResourcesHelper } from './helper/ResourcesHelper'
import { TurnFlagsHelper } from './helper/TurnFlagsHelper'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

/**
 * Shared helpers for every rule of a player turn: access to the player's piles and to the effect
 * queue of the card currently being played. Resources and turn flags live in their own {@link
 * ResourcesHelper} / {@link TurnFlagsHelper} (see `./helper`).
 */
export abstract class SanRule extends PlayerTurnRule<Corporation, MaterialType, LocationType> {
  resourcesHelper = new ResourcesHelper(this.game, this.player)
  turnFlagsHelper = new TurnFlagsHelper(this.game)

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
    return otherCorporation(this.player)
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

  /** Move the whole discard pile back onto the deck and shuffle it — the deck ran dry mid-deal. */
  reshuffleDiscardIntoDeck(): MaterialMove[] {
    return [this.discard.moveItemsAtOnce({ type: LocationType.Deck, player: this.player }), this.discard.shuffle()]
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

  /**
   * Register a card that just entered the play area: bank its revenue, lock the Mercenary type,
   * flag it for the box if it is Single Use, then queue its effects for resolution.
   */
  playCardEffects(itemIndex: number): MaterialMove[] {
    this.turnFlagsHelper.setCardPlayed()
    const id = this.material(MaterialType.Card).getItem<SanCard>(itemIndex).id
    const data = getCardData(id)
    if (!data) return [this.startRule(RuleId.ResolveEffects)]

    if (data.revenue) this.resourcesHelper.addPoints('coins', data.revenue)
    if (isMercenaryType(data.type)) this.turnFlagsHelper.lockMercenaryType(data.type)
    this.memorize(Memory.ResolvingCardIndex, itemIndex)

    const effects = clone(data.effects)
    if (effects.some((effect) => effect.type === EffectType.SingleUse)) {
      this.turnFlagsHelper.addSingleUseCard(itemIndex)
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
    for (let x = 0; x < CORRUPTION_SLOTS; x++) {
      const filled = zone.filter((item) => item.location.x === x).length
      if (filled < CORRUPTION_SLOT_CAPACITY) positions.push({ x, y: filled })
    }
    return positions
  }
}
