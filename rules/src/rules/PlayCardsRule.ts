import { CustomMove, isMoveItemType, ItemMove, MaterialMove, RuleMove, RuleStep } from '@gamepark/rules-api'
import { Corporation } from '../Corporation'
import { getCardData, isVirusCard } from '../material/CardsData'
import { CardType, SanCard } from '../material/SanCard'
import { CORRUPTION_GROUP, PROPAGANDA_END, RIVER_SIZE } from '../material/constants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { propagandaDirection, virusDirection } from './helper/directions'
import { Memory } from './Memory'
import { RuleId } from './RuleId'
import { SanRule } from './SanRule'

/** Sub-rules that keep the running turn state (re-entering PlayCards from them must not reset counters). */
const INTERNAL_RULES = [
  RuleId.ResolveEffects,
  RuleId.ChooseEffect,
  RuleId.DrawCards,
  RuleId.DestroyCard,
  RuleId.PlayFromDiscard,
  RuleId.CorruptFromHand,
  RuleId.CopyRiver
]

/**
 * Turn phase 1 — "Play one or more cards" (mandatory).
 *
 * The player plays cards from hand; each card that produces an effect goes through
 * {@link RuleId.ResolveEffects} (and its sub-rules). Resources produced by the cards are not spent
 * immediately: they pile up in per-player counters ({@link Memory}). As soon as a counter is high
 * enough, the matching spending move (corrupt a River card / advance the banner / move the Virus
 * pawn) is offered here, interleaved with playing more cards.
 *
 * Ending this phase leads to the optional {@link RuleId.BuyCards} phase, then {@link RuleId.EndTurn}.
 */
export class PlayCardsRule extends SanRule {
  onRuleStart(_move: RuleMove, previousRule?: RuleStep): MaterialMove[] {
    if (!previousRule || !INTERNAL_RULES.includes(previousRule.id as RuleId)) {
      for (const key of [Memory.CorruptionPoints, Memory.PropagandaPoints, Memory.VirusPoints, Memory.Coins, Memory.FlexPoints] as const) {
        this.memorize(key, 0, this.player)
      }
      this.forget(Memory.PlayedMercenaryType)
      this.forget(Memory.AllTypesAllowed)
      this.forget(Memory.CardPlayed)
      this.forget(Memory.SingleUseCards)
      this.forget(Memory.PendingEffects)
      this.forget(Memory.Multipliers)
    }
    return []
  }

  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []
    moves.push(...this.playCardMoves())
    moves.push(...this.corruptionMoves())
    moves.push(...this.propagandaMoves())
    moves.push(...this.virusMoves())
    if (this.remind(Memory.CardPlayed)) {
      moves.push(this.customMove(CustomMoveType.EndPlayPhase))
    }
    return moves
  }

  /** One move per playable hand card. Virus cards go straight to the discard, the rest to the play area. */
  playCardMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []
    for (const index of this.hand.getIndexes()) {
      const id = this.material(MaterialType.Card).getItem<SanCard>(index).id
      if (isVirusCard(id)) {
        moves.push(this.material(MaterialType.Card).index(index).moveItem({ type: LocationType.Discard, player: this.player }))
        continue
      }
      const data = getCardData(id)
      if (!data) continue
      if (data.type === CardType.Equipment || this.mercenaryTypePlayable(data.type)) {
        moves.push(this.material(MaterialType.Card).index(index).moveItem({ type: LocationType.PlayArea, player: this.player }))
      }
    }
    return moves
  }

  /**
   * Once 3 spiral points are banked, offer to corrupt any River card onto any free Corruption slot
   * (`x` = 0..5, the player's choice). The slot chosen — not the River column the card came from — is
   * the one whose banner crossing {@link crossingCost} then discounts (rules, p.14).
   */
  corruptionMoves(): MaterialMove[] {
    if (this.spendableResource(Memory.CorruptionPoints) < CORRUPTION_GROUP) return []
    return this.freeCorruptionPositions().flatMap((position) =>
      this.river.moveItems({ type: LocationType.CorruptionZone, player: this.player, x: position.x, y: position.y })
    )
  }

  /**
   * River card physically spanned by a banner step. The Propaganda track is numbered opposite to the
   * River (step 0 sits at the River's `x = 5` end), so a step and its River column are mirrored:
   * leaving step `s` towards step `s + 1` crosses River card `RIVER_SIZE - 1 - s`.
   */
  crossedRiverX(step: number, direction: 1 | -1): number {
    return direction === 1 ? RIVER_SIZE - 1 - step : RIVER_SIZE - step
  }

  /** Offer to advance the banner one step when enough movement points cover the crossing cost. */
  propagandaMoves(): MaterialMove[] {
    const banner = this.material(MaterialType.Banner).id(this.player)
    const item = banner.getItem()
    if (!item) return []
    const x = item.location.x ?? 0
    const direction = propagandaDirection(this.game, this.player)
    const nextX = x + direction
    if (nextX < 0 || nextX > PROPAGANDA_END) return []
    const crossedRiverX = this.crossedRiverX(x, direction)
    const points = this.spendableResource(Memory.PropagandaPoints)
    // Need at least one movement point banked, and enough to cover the (possibly reduced) cost.
    if (points < 1 || points < this.crossingCost(crossedRiverX, this.player)) return []
    return [banner.moveItem({ type: LocationType.PropagandaTrack, player: this.player, x: nextX })]
  }

  /** Crossing cost of the River card at `riverX`, adjusted by the corrupted cards facing it. */
  crossingCost(riverX: number, player: Corporation): number {
    const card = this.river.getItems<SanCard>().find((item) => item.location.x === riverX)
    const base = (card && getCardData(card.id)?.crossingCost) ?? 0
    const mine = this.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player).filter((item) => item.location.x === riverX).length
    const opponent = this.material(MaterialType.Card)
      .location(LocationType.CorruptionZone)
      .player((p) => p !== undefined && p !== player)
      .filter((item) => item.location.x === riverX).length
    return Math.max(0, base - mine + opponent)
  }

  /**
   * Each Skull point moves the Virus pawn one space along the Virus track (rulebook p.18, diagram
   * p.19). `location.x` is the signed step from the Central Port (0): the pawn stands on the
   * "cases d'avancement" of whichever side it is on — `x = ±1 … ±{@link SanRule.virusChips}` of that
   * Corporation's current top Virus card. From the opponent's last space, one more Skull towards
   * them puts the pawn back on the Central Port and drives that card off (handled in
   * {@link afterItemMove}); retreating leads back through the Port and onto the player's own card.
   */
  virusMoves(): MaterialMove[] {
    if (this.spendableResource(Memory.VirusPoints) < 1) return []
    const pawn = this.material(MaterialType.VirusPawn)
    const item = pawn.getItem()
    if (!item) return []
    const x = item.location.x ?? 0
    const dir = virusDirection(this.game, this.player) // Moon attacks towards +x, Star towards -x
    const oppChips = this.virusChips(this.virusOpponent)
    const ownChips = this.virusChips(this.player)
    const step = (target: number) => pawn.moveItem({ type: LocationType.VirusTrack, x: target })
    const moves: MaterialMove[] = []

    // Advance towards the opponent. From their last space, the step lands on the Central Port (0).
    if (x === dir * oppChips) {
      moves.push(step(0))
    } else {
      const advance = x + dir
      if (Math.sign(advance) !== dir || Math.abs(advance) <= oppChips) moves.push(step(advance))
    }

    // Retreat towards, through, and onto the player's own Virus card.
    const retreat = x - dir
    if (Math.sign(retreat) !== -dir || Math.abs(retreat) <= ownChips) moves.push(step(retreat))

    return moves
  }

  /**
   * Collect this player's "Bonus de main" token if the banner just landed on its step of the
   * Propaganda track (steps 2 and 4). The token moves next to the deck; {@link EndTurnRule.handSize}
   * then refills the hand with one extra card per collected token (rules, p.16).
   */
  collectHandBonus(step: number): MaterialMove[] {
    const token = this.material(MaterialType.HandBonusToken)
      .location(LocationType.HandBonusSpot)
      .player(this.player)
      .filter((item) => item.location.x === step)
    if (!token.length) return []
    const collected = this.material(MaterialType.HandBonusToken).location(LocationType.PlayerHandBonus).player(this.player).length
    return token.moveItems({ type: LocationType.PlayerHandBonus, player: this.player, x: collected })
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.Card)(move)) {
      if (move.location.type === LocationType.PlayArea) {
        return this.playCardEffects(move.itemIndex)
      }
      if (move.location.type === LocationType.Discard) {
        // A Virus card played from hand: no effect, but it counts as "a card played".
        this.memorize(Memory.CardPlayed, true)
        return []
      }
      if (move.location.type === LocationType.CorruptionZone) {
        this.spendResource(Memory.CorruptionPoints, CORRUPTION_GROUP)
        return this.reserve.length ? [this.reserve.deck().dealOne({ type: LocationType.River })] : []
      }
    }
    if (isMoveItemType(MaterialType.Banner)(move) && move.location.type === LocationType.PropagandaTrack) {
      const direction = propagandaDirection(this.game, this.player)
      const step = move.location.x ?? 0
      const previousStep = step - direction
      this.spendResource(Memory.PropagandaPoints, this.crossingCost(this.crossedRiverX(previousStep, direction), this.player))
      return this.collectHandBonus(step)
    }
    if (isMoveItemType(MaterialType.VirusPawn)(move) && move.location.type === LocationType.VirusTrack) {
      this.spendResource(Memory.VirusPoints, 1)
      const from = this.remind<number>(Memory.VirusPawnStep) ?? 0
      const to = move.location.x ?? 0
      this.memorize(Memory.VirusPawnStep, to)
      // Arriving on the Central Port from the opponent's last space = their top Virus card is crossed.
      const dir = virusDirection(this.game, this.player)
      if (to === 0 && from === dir * this.virusChips(this.virusOpponent)) {
        return this.driveOffTopVirusCard()
      }
      return []
    }
    return []
  }

  /**
   * The Virus pawn left the opponent's top Virus card by its far (pile-side) end: that card goes
   * onto its owner's deck. Leaving by the near (Port-side) end while retreating never touches it.
   */
  driveOffTopVirusCard(): MaterialMove[] {
    const opponent = this.virusOpponent
    const pile = this.virusPile(opponent)
    const indexes = pile.getIndexes()
    if (!indexes.length) return []
    const topIndex = indexes.reduce((best, i) =>
      (pile.getItem(i)!.location.x ?? 0) > (pile.getItem(best)!.location.x ?? 0) ? i : best
    )
    return [this.material(MaterialType.Card).index(topIndex).moveItem({ type: LocationType.Deck, player: opponent })]
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (move.type === CustomMoveType.EndPlayPhase) {
      return [this.startRule(RuleId.BuyCards)]
    }
    return []
  }
}
