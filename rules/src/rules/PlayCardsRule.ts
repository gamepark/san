import { CustomMove, isDeleteItemType, isMoveItemType, ItemMove, Location, MaterialMove } from '@gamepark/rules-api'
import { CardEffect, EffectType, getCardData, isVirusCard, isMercenaryType } from '../material/CardsData'
import { CardType, SanCard } from '../material/SanCard'
import { CORRUPTION_GROUP, PROPAGANDA_END, RIVER_SIZE } from '../material/constants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { clone } from './clone'
import { CustomMoveType } from './CustomMoveType'
import { crossingCost } from './helper/crossingCost'
import { propagandaDirection, virusDirection } from './helper/directions'
import { Memory } from './Memory'
import { RuleId } from './RuleId'
import { SanRule } from './SanRule'

/** One card posed whose "either / or" hasn't been chosen yet — see {@link Memory.PendingEitherChoices}. */
interface PendingEitherChoice {
  itemIndex: number
  options: CardEffect[]
}

/**
 * Turn phase 1 — "Play one or more cards" (mandatory).
 *
 * Every card effect turns into a banked, per-player counter the instant the card lands in the
 * play area (see {@link SanRule.playCardEffects}/{@link SanRule.applyEffect}). None of them force
 * an immediate decision: spending a counter — corrupting a card, advancing the banner, moving the
 * Virus pawn, drawing, destroying, corrupting from hand, playing from discard, copying a River
 * card or a played card, or picking a side of an "either / or" — is offered here for as long as the counter (or
 * pending choice) is non-zero, interleaved freely with playing more cards.
 *
 * Ending this phase leads to the optional {@link RuleId.BuyCards} phase, then {@link RuleId.EndTurn}.
 * Anything left unspent is lost then (see {@link import('./EndTurnRule').EndTurnRule.nextTurn}).
 */
export class PlayCardsRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    this.resourcesHelper.reset()
    this.turnFlagsHelper.reset()
    this.forget(Memory.Multipliers)
    this.forget(Memory.PendingEitherChoices)
    this.forget(Memory.CopyRiverSources)
    this.forget(Memory.CopyPlayedSources)
    return []
  }

  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []
    moves.push(...this.playCardMoves())
    moves.push(...this.corruptionMoves())
    moves.push(...this.propagandaMoves())
    moves.push(...this.virusMoves())
    moves.push(...this.drawMoves())
    moves.push(...this.destroyMoves())
    moves.push(...this.corruptFromHandMoves())
    moves.push(...this.playFromDiscardMoves())
    moves.push(...this.copyRiverMoves())
    moves.push(...this.copyPlayedMoves())
    moves.push(...this.eitherChoiceMoves())
    // Playing a card is mandatory when possible, but a player stuck with no playable card and no
    // spendable resource (no other move at all) must still be able to end the phase — the app then
    // counts this down and ends it for them (see AutoPassTimer).
    if (this.turnFlagsHelper.flags.cardPlayed || moves.length === 0) {
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
      if (data.type === CardType.Equipment || this.turnFlagsHelper.mercenaryTypePlayable(data.type)) {
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
    if (this.resourcesHelper.points('corruption') < CORRUPTION_GROUP) return []
    return this.freeCorruptionPositions().flatMap((position) =>
      this.river.moveItems({ type: LocationType.CorruptionZone, player: this.player, x: position.x, y: position.y })
    )
  }

  /** Once at least 1 charge is banked, offer to corrupt any hand card onto any free Corruption slot, for free. */
  corruptFromHandMoves(): MaterialMove[] {
    if (this.resourcesHelper.points('corruptFromHand') <= 0) return []
    return this.freeCorruptionPositions().flatMap((position) =>
      this.hand.moveItems({ type: LocationType.CorruptionZone, player: this.player, x: position.x, y: position.y })
    )
  }

  /** River card physically spanned by a banner step. The Propaganda track is numbered opposite to the
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
    const points = this.resourcesHelper.points('propaganda')
    // Need at least one movement point banked, and enough to cover the (possibly reduced) cost.
    if (points < 1 || points < crossingCost(this, crossedRiverX, this.player)) return []
    return [banner.moveItem({ type: LocationType.PropagandaTrack, player: this.player, x: nextX })]
  }

  /**
   * Each Skull point moves the Virus pawn one space along the Virus track (rulebook p.18, diagram
   * p.19), in one direction only: towards the opponent's Virus card ({@link virusDirection}) — "forward"
   * on their card, "backward" through the numbering of the player's own. `location.x` is the signed
   * step from the Central Port (0): the pawn stands on the "cases d'avancement" of whichever side it
   * is on — `x = ±1 … ±{@link SanRule.virusChips}` of that Corporation's current top Virus card.
   *
   * Every space up to the opponent's last one is offered, as far as the banked points allow (each
   * costs its distance, see {@link virusStepsCost}), so the player can spend several points in one
   * move. Driving the opponent's top card off is also a single move ({@link CustomMoveType.DriveOffVirus}):
   * it crosses every space left on that card plus one more Skull, landing the pawn on the Central Port
   * (handled in {@link beforeItemMove}). Only attacking their next card takes a second move.
   */
  virusMoves(): MaterialMove[] {
    const points = this.resourcesHelper.points('virus')
    if (points < 1) return []
    const pawn = this.material(MaterialType.VirusPawn)
    const item = pawn.getItem()
    if (!item) return []
    const x = item.location.x ?? 0
    const dir = virusDirection(this.game, this.player) // Moon attacks towards +x, Star towards -x
    const oppChips = this.virusChips(this.virusOpponent)
    if (oppChips === 0) return []
    const spacesLeft = oppChips - dir * x // up to their last space, counted from our own card too, through the Central Port

    const moves: MaterialMove[] = Array.from({ length: Math.min(points, spacesLeft) }, (_, i) =>
      pawn.moveItem({ type: LocationType.VirusTrack, x: x + dir * (i + 1) })
    )
    if (points > spacesLeft) {
      moves.push(this.customMove(CustomMoveType.DriveOffVirus))
    }
    return moves
  }

  /** Whether moving the pawn from `from` onto `to` leaves the opponent's card for the Central Port, driving their top Virus card off. */
  isVirusDriveOff(from: number, to: Partial<Location>): boolean {
    return to.x === 0 && from * virusDirection(this.game, this.player) > 0
  }

  /** Skull points spent by moving the pawn from `from` to `to`: one per space; leaving the opponent's last space for the Central Port is one more. */
  virusStepsCost(from: number, to: Partial<Location>): number {
    if (this.isVirusDriveOff(from, to)) return 1
    return Math.abs((to.x ?? 0) - from)
  }

  /** Skull points spent by {@link CustomMoveType.DriveOffVirus}: every space left up to the opponent's last one, plus one. */
  get driveOffVirusCost(): number {
    return this.driveOffVirusHops().length
  }

  /**
   * The pawn's single-space moves that drive the opponent's top Virus card off: every space up to their
   * last one, then the Central Port. Split in steps, so each one animates (a single move onto the
   * Central Port would not move at all when the pawn already stands there), and the last one sends the
   * card onto their deck ({@link beforeItemMove}).
   */
  driveOffVirusHops(): MaterialMove[] {
    const pawn = this.material(MaterialType.VirusPawn)
    const from = pawn.getItem()?.location.x ?? 0
    const dir = virusDirection(this.game, this.player)
    const last = dir * this.virusChips(this.virusOpponent)
    const spaces = Array.from({ length: Math.abs(last - from) }, (_, i) => from + dir * (i + 1))
    return [...spaces, 0].map((x) => pawn.moveItem({ type: LocationType.VirusTrack, x }))
  }

  /**
   * Once at least 1 charge is banked, offer to draw the top card of the deck. The deck is reshuffled
   * from the discard as soon as it runs out, so an empty deck means there is nothing left to draw.
   */
  drawMoves(): MaterialMove[] {
    if (this.resourcesHelper.points('draw') <= 0 || this.deck.length === 0) return []
    return [this.drawCards(this.player, 1)]
  }

  /** Once at least 1 charge is banked, offer to send any hand card to the box. */
  destroyMoves(): MaterialMove[] {
    if (this.resourcesHelper.points('destroy') <= 0) return []
    return this.hand.deleteItems()
  }

  /** Once at least 1 charge is banked, offer to play any eligible discard card. */
  playFromDiscardMoves(): MaterialMove[] {
    if (this.resourcesHelper.points('playFromDiscard') <= 0) return []
    return this.playableDiscardIndexes().map((index) =>
      this.material(MaterialType.Card).index(index).moveItem({ type: LocationType.PlayArea, player: this.player })
    )
  }

  /** Once at least 1 charge is banked, offer to adopt any eligible River card's type and effects. */
  copyRiverMoves(): MaterialMove[] {
    if (this.resourcesHelper.points('copyRiver') <= 0) return []
    return this.copyableIndexes().map((index) => this.customMove(CustomMoveType.CopyRiverCard, index))
  }

  /** Once at least 1 charge is banked, offer to adopt the type and effects of any other card played this turn. */
  copyPlayedMoves(): MaterialMove[] {
    if (this.resourcesHelper.points('copyPlayed') <= 0) return []
    return this.copyablePlayedIndexes().map((index) => this.customMove(CustomMoveType.CopyPlayedCard, index))
  }

  /** One move per option, for every played card whose "either / or" hasn't been resolved yet. */
  eitherChoiceMoves(): MaterialMove[] {
    const pending = this.remind<PendingEitherChoice[]>(Memory.PendingEitherChoices) ?? []
    return pending.flatMap((choice) =>
      choice.options.map((_, option) => this.customMove(CustomMoveType.ChooseEffectOption, { itemIndex: choice.itemIndex, option }))
    )
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

  /**
   * Runs before an item's location is mutated, so its current ("from") location can still be read —
   * {@link ItemMove} only ever carries the move's target location, never where the item came from.
   * Used for: the Virus pawn's previous step (to detect crossing the opponent's top card off), and a
   * Card move's previous location (to tell a River-funded Corruption from a free CorruptFromHand one,
   * both landing on {@link LocationType.CorruptionZone}, and to spend a PlayFromDiscard charge before
   * {@link afterItemMove} queues the card's own effects).
   */
  beforeItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.VirusPawn)(move) && move.location.type === LocationType.VirusTrack) {
      const pawn = this.material(MaterialType.VirusPawn)
      const from = pawn.getItem()?.location.x ?? 0
      const driveOff = this.isVirusDriveOff(from, move.location)
      this.resourcesHelper.spend('virus', this.virusStepsCost(from, move.location))
      return driveOff ? this.driveOffTopVirusCard() : []
    }

    if (isMoveItemType(MaterialType.Card)(move)) {
      const from = this.material(MaterialType.Card).getItem<SanCard>(move.itemIndex).location.type

      if (move.location.type === LocationType.CorruptionZone) {
        if (from === LocationType.Hand) {
          this.resourcesHelper.spend('corruptFromHand')
          return []
        }
        this.resourcesHelper.spend('corruption', CORRUPTION_GROUP)
        return this.refillRiver()
      }

      if (move.location.type === LocationType.PlayArea && from === LocationType.Discard) {
        this.resourcesHelper.spend('playFromDiscard')
      }
    }

    return []
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isDeleteItemType(MaterialType.Card)(move)) {
      this.resourcesHelper.spend('destroy')
      return []
    }
    if (isMoveItemType(MaterialType.Card)(move)) {
      if (move.location.type === LocationType.PlayArea) {
        return this.playCardEffects(move.itemIndex)
      }
      if (move.location.type === LocationType.Discard) {
        // A Virus card played from hand: no effect, but it counts as "a card played".
        this.turnFlagsHelper.setCardPlayed()
        return []
      }
    }
    if (isMoveItemType(MaterialType.Banner)(move) && move.location.type === LocationType.PropagandaTrack) {
      const direction = propagandaDirection(this.game, this.player)
      const step = move.location.x ?? 0
      const previousStep = step - direction
      this.resourcesHelper.spend('propaganda', crossingCost(this, this.crossedRiverX(previousStep, direction), this.player))
      return this.collectHandBonus(step)
    }
    return []
  }

  /**
   * The Virus pawn left the opponent's top Virus card by its far (pile-side) end: that card goes
   * onto its owner's deck. Leaving by the near (Port-side) end while retreating never touches it.
   *
   * No `x` (rules, p.19: "placez cette carte... sur la pioche"): Deck uses a
   * {@link import('@gamepark/rules-api').PositiveSequenceStrategy}, which then appends the card after
   * every existing one — and `deck()` draws the highest `x` first, so that is the top of the deck.
   */
  driveOffTopVirusCard(): MaterialMove[] {
    const opponent = this.virusOpponent
    return this.virusPile(opponent)
      .maxBy((item) => item.location.x ?? 0)
      .moveItems({ type: LocationType.Deck, player: opponent })
  }

  /**
   * Apply the type and effects of the card at `copiedIndex` on behalf of the oldest card still holding
   * an unspent copy charge (`sourcesKey`, FIFO). If the copied card is Single Use, that source card is
   * the one sent to the box at end of turn (rules, p.20).
   */
  copyCard(copiedIndex: number, sourcesKey: Memory.CopyRiverSources | Memory.CopyPlayedSources): void {
    const id = this.material(MaterialType.Card).getItem<SanCard>(copiedIndex).id
    const data = getCardData(id)!
    if (isMercenaryType(data.type)) this.turnFlagsHelper.lockMercenaryType(data.type)

    const sources = this.remind<number[]>(sourcesKey) ?? []
    const sourceIndex = sources.shift()
    this.memorize(sourcesKey, sources)
    if (sourceIndex === undefined) return

    const effects: CardEffect[] = clone(data.effects)
    if (effects.some((effect) => effect.type === EffectType.SingleUse)) {
      this.turnFlagsHelper.addSingleUseCard(sourceIndex)
    }
    for (const effect of effects.filter((effect) => effect.type !== EffectType.SingleUse)) {
      this.applyEffect(sourceIndex, effect)
    }
    this.applyMultipliers()
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    switch (move.type) {
      case CustomMoveType.EndPlayPhase:
        return [this.startRule(RuleId.BuyCards)]

      case CustomMoveType.Draw:
        this.resourcesHelper.spend('draw')
        return []

      case CustomMoveType.CopyRiverCard:
        this.resourcesHelper.spend('copyRiver')
        this.copyCard(move.data as number, Memory.CopyRiverSources)
        return []

      case CustomMoveType.CopyPlayedCard:
        this.resourcesHelper.spend('copyPlayed')
        this.copyCard(move.data as number, Memory.CopyPlayedSources)
        return []

      case CustomMoveType.DriveOffVirus:
        return this.driveOffVirusHops()

      case CustomMoveType.ChooseEffectOption: {
        const { itemIndex, option } = move.data as { itemIndex: number; option: number }
        const pending = this.remind<PendingEitherChoice[]>(Memory.PendingEitherChoices) ?? []
        const index = pending.findIndex((choice) => choice.itemIndex === itemIndex)
        if (index === -1) return []
        const [choice] = pending.splice(index, 1)
        this.memorize(Memory.PendingEitherChoices, pending)
        const chosen = choice.options[option]
        if (chosen) {
          this.applyEffect(itemIndex, chosen)
          this.applyMultipliers()
        }
        return []
      }

      default:
        return []
    }
  }
}
