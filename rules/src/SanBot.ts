import {
  CustomMove,
  isCustomMoveType,
  isDeleteItemType,
  isMoveItemType,
  Location,
  MaterialGame,
  MaterialMove,
  MoveItem,
  RandomBot
} from '@gamepark/rules-api'
import { Corporation, otherCorporation } from './Corporation'
import { CardEffect, EffectType, getCardData, isMercenaryType, isVirusCard } from './material/CardsData'
import { CORRUPTION_GROUP, CORRUPTION_WIN, PROPAGANDA_END, VIRUS_WIN } from './material/constants'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CardType, SanCard } from './material/SanCard'
import { BuyCardsRule } from './rules/BuyCardsRule'
import { CustomMoveType } from './rules/CustomMoveType'
import { crossingCost } from './rules/helper/crossingCost'
import { propagandaDirection } from './rules/helper/directions'
import { corruptedCards, propagandaSteps as trackSteps, virusCardsDrivenOff } from './rules/helper/victory'
import { Memory } from './rules/Memory'
import { PlayCardsRule } from './rules/PlayCardsRule'
import { RuleId } from './rules/RuleId'
import { SanRule } from './rules/SanRule'
import { SanRules } from './SanRules'

type CardMove = MoveItem<Corporation, MaterialType, LocationType>

/** A Corruption move under evaluation: the River column whose card is replaced, and the slot receiving a card. */
interface CorruptionSimulation {
  corruptedRiverX?: number
  slotX?: number
}

/**
 * A simple heuristic opponent, used as the tutorial / "monkey opponents" bot.
 *
 * During the "play cards" phase it goes through a fixed order of preference, re-evaluated after every
 * move (see {@link playCardsMoves}): play as many hand cards as possible (Equipment first, then a
 * single Mercenary type), play from the discard, draw, copy a River card, corrupt / destroy from hand,
 * corrupt a River card, resolve "either / or" choices, advance the banner, then the Virus pawn as far
 * as possible. It then buys the
 * affordable River card worth the most rather than passing (see {@link buyCardsMoves}).
 */
export class SanBot extends RandomBot<MaterialGame<Corporation, MaterialType, LocationType>, MaterialMove<Corporation, MaterialType, LocationType>, Corporation> {
  constructor(playerId: Corporation) {
    super(SanRules, playerId)
  }

  override getLegalMoves(game: MaterialGame<Corporation, MaterialType, LocationType>): MaterialMove<Corporation, MaterialType, LocationType>[] {
    const legalMoves = super.getLegalMoves(game)
    switch (game.rule?.id) {
      case RuleId.PlayCards:
        return this.playCardsMoves(new PlayCardsRule(game), legalMoves)
      case RuleId.BuyCards:
        return this.buyCardsMoves(new BuyCardsRule(game), legalMoves)
      default:
        return legalMoves
    }
  }

  /**
   * The first step of the order of preference that has a move to offer. Every banked resource stays
   * spendable until the phase ends, so nothing is lost by spending them in this order — and drawing
   * or playing from the discard early leaves the new cards time to be played too.
   */
  private playCardsMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const steps = [
      () => this.playFromHandMoves(rule, legalMoves),
      () => this.playFromDiscardMoves(rule, legalMoves),
      () => this.drawMoves(legalMoves),
      () => this.copyRiverMoves(rule, legalMoves),
      () => this.copyPlayedMoves(rule, legalMoves),
      () => this.corruptFromHandMoves(rule, legalMoves),
      () => this.destroyMoves(rule, legalMoves),
      () => this.corruptRiverMoves(rule, legalMoves),
      () => this.eitherChoiceMoves(rule, legalMoves),
      () => legalMoves.filter(isMoveItemType(MaterialType.Banner)),
      () => this.virusMoves(rule, legalMoves)
    ]
    for (const step of steps) {
      const moves = step()
      if (moves.length) return moves
    }
    const endMoves = legalMoves.filter(isCustomMoveType(CustomMoveType.EndPlayPhase))
    return endMoves.length ? endMoves : legalMoves
  }

  /** Legal moves of a Card from `from` to `to`. */
  private cardMoves(rule: PlayCardsRule, legalMoves: MaterialMove[], from: LocationType, ...to: LocationType[]): CardMove[] {
    return legalMoves
      .filter(isMoveItemType(MaterialType.Card))
      .filter((move) => to.includes(move.location.type!) && rule.material(MaterialType.Card).getItem(move.itemIndex).location.type === from)
  }

  private cardId(rule: PlayCardsRule, itemIndex: number): SanCard {
    return rule.material(MaterialType.Card).getItem<SanCard>(itemIndex).id
  }

  /**
   * Rough worth of a card in a deck: a Virus card does nothing (-1), a starting card is weak (0), a
   * River card is worth its price.
   */
  private cardValue(id: SanCard): number {
    if (isVirusCard(id)) return -1
    return getCardData(id)?.cost ?? 0
  }

  /** The moves of the most valuable card among `moves` (all its moves: it may have several destinations). */
  private bestCardMoves(rule: PlayCardsRule, moves: CardMove[]): CardMove[] {
    if (!moves.length) return []
    const best = Math.max(...moves.map((move) => this.cardValue(this.cardId(rule, move.itemIndex))))
    return moves.filter((move) => this.cardValue(this.cardId(rule, move.itemIndex)) === best)
  }

  /**
   * Play as many hand cards as possible: Equipment first (it may lift the one-type restriction or draw
   * cards before a type is committed to), then — after spending any banked draw while no type is
   * committed yet — the best Mercenary type (see {@link bestMercenaryTypeMoves}), then the Equipment
   * giving nothing but Propaganda, only if the banner can then advance (see {@link canAdvance}) —
   * otherwise it stays in hand for a later turn —, then the Virus cards — unless a destroy / corrupt-from-hand charge is banked: that charge will get rid
   * of them for good rather than sending them to the discard, to come back later.
   */
  private playFromHandMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = this.cardMoves(rule, legalMoves, LocationType.Hand, LocationType.PlayArea, LocationType.Discard)
    const typeOf = (move: CardMove) => getCardData(this.cardId(rule, move.itemIndex))?.type
    const equipmentMoves = moves.filter((move) => typeOf(move) === CardType.Equipment)
    const propagandaOnlyMoves = equipmentMoves.filter((move) => this.isPropagandaOnly(this.cardId(rule, move.itemIndex)))
    const otherEquipmentMoves = equipmentMoves.filter((move) => !propagandaOnlyMoves.includes(move))
    if (otherEquipmentMoves.length) return otherEquipmentMoves
    const mercenaryMoves = moves.filter((move) => {
      const type = typeOf(move)
      return type !== undefined && isMercenaryType(type)
    })
    if (mercenaryMoves.length) {
      if (this.drawBeforeCommittingType(rule, legalMoves)) return this.drawMoves(legalMoves)
      const bestMoves = this.bestMercenaryTypeMoves(rule, mercenaryMoves)
      if (bestMoves.length) return bestMoves
    }
    if (propagandaOnlyMoves.length) {
      const points = this.upcomingPropaganda(rule)
      if (this.canAdvance(rule, points)) return propagandaOnlyMoves
    }
    const keepVirusCards = rule.resourcesHelper.resources.destroy > 0 || rule.resourcesHelper.resources.corruptFromHand > 0
    return keepVirusCards ? [] : moves.filter((move) => isVirusCard(this.cardId(rule, move.itemIndex)))
  }

  /** Play the most valuable discard card — only an Equipment one while a draw should come first (see {@link drawBeforeCommittingType}). */
  private playFromDiscardMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = this.cardMoves(rule, legalMoves, LocationType.Discard, LocationType.PlayArea)
    const drawFirst = this.drawBeforeCommittingType(rule, legalMoves)
    return this.bestCardMoves(
      rule,
      moves.filter((move) => !drawFirst || getCardData(this.cardId(rule, move.itemIndex))?.type === CardType.Equipment)
    )
  }

  private drawMoves(legalMoves: MaterialMove[]): MaterialMove[] {
    return legalMoves.filter(isCustomMoveType(CustomMoveType.Draw))
  }

  /**
   * Whether to draw before playing a Mercenary card while no type is committed to yet: the cards drawn
   * may change which type is the best one.
   */
  private drawBeforeCommittingType(rule: PlayCardsRule, legalMoves: MaterialMove[]): boolean {
    const flags = rule.turnFlagsHelper.flags
    return flags.playedMercenaryType === undefined && !flags.allTypesAllowed && this.drawMoves(legalMoves).length > 0
  }

  /**
   * The first Mercenary card played locks the turn to its type (see TurnFlagsHelper.lockMercenaryType).
   * A type is worth committing to only if it achieves something (see {@link mercenaryTypePriority}):
   * Propaganda must make the banner cross at least one step, Corruption must complete a group of 3,
   * Hacking always does. Among those, the type with the most cards in hand wins, so that the most of
   * them actually get played; a tie goes to Propaganda, then Corruption, then Hacking.
   * When no type achieves anything, a stuck Propaganda is still played (for its revenue), a
   * Corruption short of a group never is: no move is returned then.
   */
  private bestMercenaryTypeMoves(rule: PlayCardsRule, moves: CardMove[]): CardMove[] {
    const flags = rule.turnFlagsHelper.flags
    if (flags.playedMercenaryType !== undefined || flags.allTypesAllowed) return moves
    const movesByType = new Map<CardType, CardMove[]>()
    for (const move of moves) {
      const type = getCardData(this.cardId(rule, move.itemIndex))!.type
      movesByType.set(type, [...(movesByType.get(type) ?? []), move])
    }
    const types = [...movesByType.entries()].map(([type, typeMoves]) => ({ moves: typeMoves, priority: this.mercenaryTypePriority(rule, type, typeMoves) }))
    const useful = types.filter((type) => type.priority > 0)
    const candidates = useful.length ? useful : types.filter((type) => type.priority === 0)
    if (!candidates.length) return []
    return candidates.reduce((best, candidate) =>
      candidate.moves.length > best.moves.length || (candidate.moves.length === best.moves.length && candidate.priority > best.priority) ? candidate : best
    ).moves
  }

  /**
   * What committing the turn to `type` achieves, `moves` being the hand cards of that type the bot can
   * play: 3 = Propaganda crossing a step, 2 = Corruption completing a group, 1 = Hacking,
   * 0 = Propaganda leaving the banner stuck, -1 = Corruption short of a group.
   */
  private mercenaryTypePriority(rule: PlayCardsRule, type: CardType, moves: CardMove[]): number {
    const cards = moves.map((move) => this.cardId(rule, move.itemIndex))
    switch (type) {
      case CardType.Propaganda: {
        const points =
          rule.resourcesHelper.resources.propaganda + this.potentialPoints(rule, EffectType.Propaganda, type, cards) + this.propagandaOnlyHandPoints(rule)
        return this.canAdvance(rule, points) ? 3 : 0
      }
      case CardType.Corruption: {
        const points = rule.resourcesHelper.resources.corruption + this.potentialPoints(rule, EffectType.Corruption, type, cards)
        return points >= CORRUPTION_GROUP && rule.freeCorruptionPositions().length > 0 ? 2 : -1
      }
      default:
        return 1
    }
  }

  /**
   * The `resource` points playing `cards` (all of Mercenary type `type`) would bring at best: their
   * plain gains, their Multipliers counting every card of that type played this turn, and the matching
   * side of their "either / or" — plus that side on the "either / or" choices still pending.
   */
  private potentialPoints(rule: PlayCardsRule, resource: EffectType, type: CardType, cards: SanCard[]): number {
    const playedOfType = rule.playArea.getItems<SanCard>().filter((item) => getCardData(item.id)?.type === type).length
    const effectPoints = (effect: CardEffect): number => {
      switch (effect.type) {
        case resource:
          return effect.value ?? 0
        case EffectType.Multiplier:
          return effect.gain === resource ? (effect.value ?? 1) * (playedOfType + cards.length) : 0
        case EffectType.Either:
          return Math.max(0, ...effect.option!.map(effectPoints))
        default:
          return 0
      }
    }
    return (
      cards.reduce((sum, id) => sum + (getCardData(id)?.effects ?? []).reduce((cardSum, effect) => cardSum + effectPoints(effect), 0), 0) +
      this.pendingPoints(rule, resource)
    )
  }

  /** The `resource` points the "either / or" choices still pending could bring, taking that side on each. */
  private pendingPoints(rule: PlayCardsRule, resource: EffectType): number {
    const pending = rule.remind<{ options: CardEffect[] }[]>(Memory.PendingEitherChoices) ?? []
    const side = (effect: CardEffect) => (effect.type === resource ? (effect.value ?? 0) : 0)
    return pending.reduce((sum, choice) => sum + Math.max(0, ...choice.options.map(side)), 0)
  }

  /** An Equipment card giving nothing but Propaganda points (e.g. "+3 arrows"): useless unless the banner can advance. */
  private isPropagandaOnly(id: SanCard): boolean {
    const data = getCardData(id)
    if (data?.type !== CardType.Equipment) return false
    return data.effects.some((effect) => effect.type === EffectType.Propaganda) && data.effects.every((effect) => effect.type === EffectType.Propaganda || effect.type === EffectType.SingleUse)
  }

  /**
   * The Propaganda points this turn can still count on once the Mercenary cards are played: banked,
   * pending "either / or" choices, and the {@link isPropagandaOnly} Equipment cards in hand.
   */
  private upcomingPropaganda(rule: PlayCardsRule): number {
    return rule.resourcesHelper.resources.propaganda + this.pendingPoints(rule, EffectType.Propaganda) + this.propagandaOnlyHandPoints(rule)
  }

  /** The Propaganda points of the {@link isPropagandaOnly} Equipment cards in hand. */
  private propagandaOnlyHandPoints(rule: PlayCardsRule): number {
    return rule.hand
      .getItems<SanCard>()
      .filter((item) => this.isPropagandaOnly(item.id))
      .reduce((sum, item) => sum + getCardData(item.id)!.effects.reduce((cardSum, effect) => cardSum + (effect.type === EffectType.Propaganda ? (effect.value ?? 0) : 0), 0), 0)
  }

  /**
   * Whether `points` Propaganda points can make the banner cross at least one step this turn, counting
   * the Corruption the banked points allow: a group of 3 replaces the card in front of the banner with
   * the top of the Reserve when it is cheaper to cross, and puts the corrupted card in front of the
   * banner (-1); a corrupt-from-hand charge does the latter only.
   */
  private canAdvance(rule: PlayCardsRule, points: number): boolean {
    if (this.propagandaSteps(rule, this.player, points) > 0) return true
    const myFront = this.frontRiverX(rule, this.player)
    if (myFront === undefined) return false
    const resources = rule.resourcesHelper.resources
    const freeSlot = rule.freeCorruptionPositions().some((position) => position.x === myFront)
    const slotX = freeSlot ? myFront : undefined
    if (resources.corruption >= CORRUPTION_GROUP && rule.freeCorruptionPositions().length) {
      const next = this.reserveTopCrossingCost(rule)
      const corruptedRiverX = next !== undefined && next < this.riverCrossingCost(rule, myFront) ? myFront : undefined
      if (this.propagandaSteps(rule, this.player, points, { corruptedRiverX, slotX }) > 0) return true
    }
    return resources.corruptFromHand > 0 && slotX !== undefined && this.propagandaSteps(rule, this.player, points, { slotX }) > 0
  }

  /** Copy the most valuable copyable River card. */
  private copyRiverMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = legalMoves.filter(isCustomMoveType(CustomMoveType.CopyRiverCard)) as CustomMove[]
    if (!moves.length) return []
    const value = (move: CustomMove) => this.cardValue(this.cardId(rule, move.data as number))
    const best = Math.max(...moves.map(value))
    return moves.filter((move) => value(move) === best)
  }

  /** Copy the most valuable card played this turn. */
  private copyPlayedMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = legalMoves.filter(isCustomMoveType(CustomMoveType.CopyPlayedCard)) as CustomMove[]
    if (!moves.length) return []
    const value = (move: CustomMove) => this.cardValue(this.cardId(rule, move.data as number))
    const best = Math.max(...moves.map(value))
    return moves.filter((move) => value(move) === best)
  }

  /** Corrupting from hand always progresses the Corruption victory: send the least valuable hand card. */
  private corruptFromHandMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = this.cardMoves(rule, legalMoves, LocationType.Hand, LocationType.CorruptionZone)
    if (!moves.length) return []
    const worst = Math.min(...moves.map((move) => this.cardValue(this.cardId(rule, move.itemIndex))))
    const slot = this.corruptionSlot(rule, {})
    return moves.filter((move) => move.location.x === slot && this.cardValue(this.cardId(rule, move.itemIndex)) === worst)
  }

  /** Only destroy Virus and starting cards: removing a bought River card from the deck would be a loss. */
  private destroyMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = legalMoves
      .filter(isDeleteItemType(MaterialType.Card))
      .filter((move) => this.cardValue(this.cardId(rule, move.itemIndex)) <= 0)
    if (!moves.length) return []
    const worst = Math.min(...moves.map((move) => this.cardValue(this.cardId(rule, move.itemIndex))))
    return moves.filter((move) => this.cardValue(this.cardId(rule, move.itemIndex)) === worst)
  }

  /**
   * Corrupt a River card, knowing its slot is refilled from the top of the (visible) Reserve: among the
   * ones letting the banner advance the furthest this turn (Propaganda points still to come included),
   * the one whose replacement best lowers the crossing in front of this player's banner and raises the one in
   * front of the opponent's (see {@link replacementGain}). When no replacement changes anything, a
   * card in front of neither banner is preferred.
   *
   * The receiving slot is chosen by {@link corruptionSlot}.
   */
  private corruptRiverMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = this.cardMoves(rule, legalMoves, LocationType.River, LocationType.CorruptionZone)
    if (!moves.length) return []
    const riverX = (move: CardMove) => rule.material(MaterialType.Card).getItem(move.itemIndex).location.x!
    let columns = [...new Set(moves.map(riverX))]
    const points = this.upcomingPropaganda(rule)
    const steps = (x: number) => this.propagandaSteps(rule, this.player, points, { corruptedRiverX: x, slotX: this.corruptionSlot(rule, { corruptedRiverX: x }) })
    const bestSteps = Math.max(...columns.map(steps))
    if (bestSteps > this.propagandaSteps(rule, this.player, points)) columns = columns.filter((x) => steps(x) === bestSteps)
    const best = Math.max(...columns.map((x) => this.replacementGain(rule, x)))
    let targets = columns.filter((x) => this.replacementGain(rule, x) === best)
    if (best === 0) {
      const fronts = [this.frontRiverX(rule, this.player), this.frontRiverX(rule, otherCorporation(this.player))]
      const others = targets.filter((x) => !fronts.includes(x))
      if (others.length) targets = others
    }
    return targets.flatMap((x) => {
      const slot = this.corruptionSlot(rule, { corruptedRiverX: x })
      return moves.filter((move) => riverX(move) === x && move.location.x === slot)
    })
  }

  /**
   * What replacing the River card in column `x` with the top of the Reserve (after a corruption or a
   * purchase) is worth on the Propaganda tracks: the crossing cost it takes off the card in front of
   * this player's banner, plus the one it adds to the card in front of the opponent's.
   */
  private replacementGain(rule: SanRule, x: number): number {
    const next = this.reserveTopCrossingCost(rule)
    if (next === undefined) return 0
    const delta = next - this.riverCrossingCost(rule, x)
    let gain = 0
    if (this.frontRiverX(rule, this.player) === x) gain -= delta
    if (this.frontRiverX(rule, otherCorporation(this.player)) === x) gain += delta
    return gain
  }

  /**
   * Where to put a corrupted card: in front of this player's banner if the discount lets it advance
   * further this turn (see {@link upcomingPropaganda}), otherwise in front of the opponent's banner
   * to slow them down, otherwise in front of this player's banner anyway.
   */
  private corruptionSlot(rule: PlayCardsRule, simulation: CorruptionSimulation): number | undefined {
    const free = rule.freeCorruptionPositions().map((position) => position.x)
    const myFront = this.frontRiverX(rule, this.player)
    const opponentFront = this.frontRiverX(rule, otherCorporation(this.player))
    if (myFront !== undefined && free.includes(myFront)) {
      const points = this.upcomingPropaganda(rule)
      const before = this.propagandaSteps(rule, this.player, points, simulation)
      const after = this.propagandaSteps(rule, this.player, points, { ...simulation, slotX: myFront })
      if (after > before) return myFront
    }
    if (opponentFront !== undefined && free.includes(opponentFront)) return opponentFront
    if (myFront !== undefined && free.includes(myFront)) return myFront
    return free[0]
  }

  /** River column of the next card a player's banner has to cross, if it has not reached the end of its track. */
  private frontRiverX(rule: SanRule, player: Corporation): number | undefined {
    const x = rule.material(MaterialType.Banner).id(player).getItem()?.location.x ?? 0
    const direction = propagandaDirection(rule.game, player)
    const next = x + direction
    if (next < 0 || next > PROPAGANDA_END) return undefined
    return rule.crossedRiverX(x, direction)
  }

  /** Printed crossing cost of the River card in column `x`. */
  private riverCrossingCost(rule: SanRule, x: number): number {
    const card = rule.river.getItems<SanCard>().find((item) => item.location.x === x)
    return (card && getCardData(card.id)?.crossingCost) ?? 0
  }

  /** Printed crossing cost of the card that will refill the next emptied River slot. */
  private reserveTopCrossingCost(rule: SanRule): number | undefined {
    const top = rule.reserve.deck().getItems<SanCard>()[0]
    return top ? (getCardData(top.id)?.crossingCost ?? 0) : undefined
  }

  /** {@link crossingCost}, as it would be after the simulated Corruption move. */
  private simulatedCrossingCost(rule: PlayCardsRule, riverX: number, player: Corporation, simulation: CorruptionSimulation): number {
    const { corruptedRiverX, slotX } = simulation
    if (corruptedRiverX === undefined && slotX === undefined) return crossingCost(rule, riverX, player)
    const base = riverX === corruptedRiverX ? (this.reserveTopCrossingCost(rule) ?? 0) : this.riverCrossingCost(rule, riverX)
    const zone = rule.material(MaterialType.Card).location(LocationType.CorruptionZone).filter((item) => item.location.x === riverX)
    let mine = zone.player(player).length
    let theirs = zone.length - mine
    if (slotX === riverX) {
      if (player === this.player) mine++
      else theirs++
    }
    return Math.max(0, base - mine + theirs)
  }

  /** How many steps `player`'s banner could advance with `points` Propaganda points. */
  private propagandaSteps(rule: PlayCardsRule, player: Corporation, points: number, simulation: CorruptionSimulation = {}): number {
    const direction = propagandaDirection(rule.game, player)
    let x = rule.material(MaterialType.Banner).id(player).getItem()?.location.x ?? 0
    let steps = 0
    while (x + direction >= 0 && x + direction <= PROPAGANDA_END && points >= 1) {
      const cost = this.simulatedCrossingCost(rule, rule.crossedRiverX(x, direction), player, simulation)
      if (points < cost) break
      points -= cost
      x += direction
      steps++
    }
    return steps
  }

  /**
   * Resolve the oldest pending "either / or": Propaganda if it lets the banner advance one more step,
   * otherwise Corruption if it completes a group of 3 (both counting the other pending choices) — Corruption first on a turn committed to it,
   * since that group is what the turn was committed for (see {@link mercenaryTypePriority}) —
   * otherwise Virus (drawing, then the first option, when the card offers neither).
   */
  private eitherChoiceMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = legalMoves.filter(isCustomMoveType(CustomMoveType.ChooseEffectOption)) as CustomMove[]
    if (!moves.length) return []
    const itemIndex = (moves[0].data as { itemIndex: number }).itemIndex
    const pending = rule.remind<{ itemIndex: number; options: CardEffect[] }[]>(Memory.PendingEitherChoices) ?? []
    const options = pending.find((choice) => choice.itemIndex === itemIndex)?.options ?? []
    const others = pending.filter((choice) => choice.itemIndex !== itemIndex).map((choice) => choice.options)
    const option = this.bestEitherOption(rule, options, others)
    return moves.filter((move) => {
      const data = move.data as { itemIndex: number; option: number }
      return data.itemIndex === itemIndex && data.option === option
    })
  }

  /**
   * `others` are the options of the other pending "either / or": a side that only reaches a banner step
   * or a group of 3 together with theirs is taken too, the next choices then completing it.
   */
  private bestEitherOption(rule: PlayCardsRule, options: CardEffect[], others: CardEffect[][]): number {
    const find = (type: EffectType) => options.findIndex((effect) => effect.type === type)
    const resources = rule.resourcesHelper.resources
    const later = (type: EffectType) =>
      others.reduce((sum, choice) => sum + Math.max(0, ...choice.filter((effect) => effect.type === type).map((effect) => effect.value ?? 0)), 0)

    const propagandaOption = () => {
      const propaganda = find(EffectType.Propaganda)
      if (propaganda === -1) return -1
      const points = resources.propaganda
      const reachable = points + (options[propaganda].value ?? 0) + later(EffectType.Propaganda)
      const advances = this.propagandaSteps(rule, this.player, reachable) > this.propagandaSteps(rule, this.player, points)
      return advances ? propaganda : -1
    }
    const corruptionOption = () => {
      const corruption = find(EffectType.Corruption)
      if (corruption === -1 || !rule.freeCorruptionPositions().length) return -1
      const points = resources.corruption
      const reachable = points + (options[corruption].value ?? 0) + later(EffectType.Corruption)
      const completesGroup = Math.floor(reachable / CORRUPTION_GROUP) > Math.floor(points / CORRUPTION_GROUP)
      return completesGroup ? corruption : -1
    }
    const corruptionTurn = rule.turnFlagsHelper.flags.playedMercenaryType === CardType.Corruption
    for (const option of corruptionTurn ? [corruptionOption, propagandaOption] : [propagandaOption, corruptionOption]) {
      const index = option()
      if (index !== -1) return index
    }

    for (const type of [EffectType.Virus, EffectType.Draw]) {
      const index = find(type)
      if (index !== -1) return index
    }
    return 0
  }

  /** Move the Virus pawn as far as the banked points allow. */
  private virusMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const driveOff = legalMoves.filter(isCustomMoveType(CustomMoveType.DriveOffVirus))
    if (driveOff.length) return driveOff
    const moves = legalMoves.filter(isMoveItemType(MaterialType.VirusPawn))
    if (!moves.length) return []
    const from = rule.material(MaterialType.VirusPawn).getItem()?.location.x ?? 0
    const cost = (location: Partial<Location>) => rule.virusStepsCost(from, location)
    const farthest = Math.max(...moves.map((move) => cost(move.location)))
    return moves.filter((move) => cost(move.location) === farthest)
  }

  /**
   * Buy the River card worth the most — its price (see {@link cardValue}), its revenue while the game
   * is young (see {@link revenueWeight}), and what its replacement from the Reserve does to both
   * banners' crossings (see {@link replacementGain}) — instead of passing; passes when none is affordable.
   */
  private buyCardsMoves(rule: BuyCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const buyMoves = legalMoves.filter(isMoveItemType(MaterialType.Card))
    if (!buyMoves.length) return legalMoves
    const revenueWeight = this.revenueWeight(new SanRules(rule.game))
    const item = (move: CardMove) => rule.material(MaterialType.Card).getItem<SanCard>(move.itemIndex)
    const score = (move: CardMove) =>
      this.cardValue(item(move).id) + (getCardData(item(move).id)?.revenue ?? 0) * revenueWeight + this.replacementGain(rule, item(move).location.x!)
    const best = Math.max(...buyMoves.map(score))
    return buyMoves.filter((move) => score(move) === best)
  }

  /**
   * How much a coin of revenue is worth next to a point of price: 1 at the start of the game, down to 0
   * once either player is halfway to any victory condition — a card bought then will not be played
   * often enough to pay for itself.
   */
  private revenueWeight(rules: SanRules): number {
    const progress = Math.max(
      ...rules.game.players.flatMap((player) => [
        corruptedCards(rules, player) / CORRUPTION_WIN,
        trackSteps(rules, player) / PROPAGANDA_END,
        virusCardsDrivenOff(rules, player) / VIRUS_WIN
      ])
    )
    return Math.max(0, 1 - 2 * progress)
  }
}
