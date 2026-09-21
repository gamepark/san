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
import { CORRUPTION_GROUP, PROPAGANDA_END } from './material/constants'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CardType, SanCard } from './material/SanCard'
import { CustomMoveType } from './rules/CustomMoveType'
import { crossingCost } from './rules/helper/crossingCost'
import { propagandaDirection } from './rules/helper/directions'
import { Memory } from './rules/Memory'
import { PlayCardsRule } from './rules/PlayCardsRule'
import { RuleId } from './rules/RuleId'
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
 * as possible. It then buys the first River card it can afford rather than passing.
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
        return this.buyCardsMoves(legalMoves)
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
   * committed yet — the Mercenary type with the most cards in hand, then
   * the Virus cards — unless a destroy / corrupt-from-hand charge is banked: that charge will get rid
   * of them for good rather than sending them to the discard, to come back later.
   */
  private playFromHandMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = this.cardMoves(rule, legalMoves, LocationType.Hand, LocationType.PlayArea, LocationType.Discard)
    const typeOf = (move: CardMove) => getCardData(this.cardId(rule, move.itemIndex))?.type
    const equipmentMoves = moves.filter((move) => typeOf(move) === CardType.Equipment)
    if (equipmentMoves.length) return equipmentMoves
    const mercenaryMoves = moves.filter((move) => {
      const type = typeOf(move)
      return type !== undefined && isMercenaryType(type)
    })
    if (mercenaryMoves.length) {
      return this.drawBeforeCommittingType(rule, legalMoves) ? this.drawMoves(legalMoves) : this.bestMercenaryTypeMoves(rule, mercenaryMoves)
    }
    const keepVirusCards = rule.resourcesHelper.points('destroy') > 0 || rule.resourcesHelper.points('corruptFromHand') > 0
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
   * The first Mercenary card played locks the turn to its type (see TurnFlagsHelper.lockMercenaryType):
   * committing to whichever type has the most cards in hand lets the most of them actually get played.
   * On a tie, Hacking wins it: its points are spent one at a time, so unlike a Corruption group of 3 or
   * a variable Propaganda crossing cost, none of them can end up banked and wasted.
   */
  private bestMercenaryTypeMoves(rule: PlayCardsRule, moves: CardMove[]): CardMove[] {
    const flags = rule.turnFlagsHelper.flags
    if (flags.playedMercenaryType !== undefined || flags.allTypesAllowed) return moves
    const movesByType = new Map<CardType, CardMove[]>()
    for (const move of moves) {
      const type = getCardData(this.cardId(rule, move.itemIndex))!.type
      movesByType.set(type, [...(movesByType.get(type) ?? []), move])
    }
    const maxCount = Math.max(...[...movesByType.values()].map((typeMoves) => typeMoves.length))
    const hackingMoves = movesByType.get(CardType.Hacking)
    if (hackingMoves?.length === maxCount) return hackingMoves
    return [...movesByType.values()].find((typeMoves) => typeMoves.length === maxCount)!
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
   * Corrupt a River card, knowing its slot is refilled from the top of the (visible) Reserve:
   * - the card in front of this player's banner, if it costs more to cross than the one replacing it;
   * - otherwise the card in front of the opponent's banner, if it costs them less than its replacement;
   * - otherwise any other card, leaving both crossings unchanged.
   *
   * The receiving slot is chosen by {@link corruptionSlot}.
   */
  private corruptRiverMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = this.cardMoves(rule, legalMoves, LocationType.River, LocationType.CorruptionZone)
    if (!moves.length) return []
    const riverX = (move: CardMove) => rule.material(MaterialType.Card).getItem(move.itemIndex).location.x
    const columns = [...new Set(moves.map(riverX))]
    const myFront = this.frontRiverX(rule, this.player)
    const opponentFront = this.frontRiverX(rule, otherCorporation(this.player))
    const next = this.reserveTopCrossingCost(rule)

    let targets: (number | undefined)[]
    if (next !== undefined && myFront !== undefined && columns.includes(myFront) && this.riverCrossingCost(rule, myFront) > next) {
      targets = [myFront]
    } else if (next !== undefined && opponentFront !== undefined && columns.includes(opponentFront) && this.riverCrossingCost(rule, opponentFront) < next) {
      targets = [opponentFront]
    } else {
      const others = columns.filter((x) => x !== myFront && x !== opponentFront)
      targets = others.length ? others : columns
    }
    return targets.flatMap((x) => {
      const slot = this.corruptionSlot(rule, { corruptedRiverX: x })
      return moves.filter((move) => riverX(move) === x && move.location.x === slot)
    })
  }

  /**
   * Where to put a corrupted card: in front of this player's banner if the discount lets it advance
   * further with the Propaganda points banked right now, otherwise in front of the opponent's banner
   * to slow them down, otherwise in front of this player's banner anyway.
   */
  private corruptionSlot(rule: PlayCardsRule, simulation: CorruptionSimulation): number | undefined {
    const free = rule.freeCorruptionPositions().map((position) => position.x)
    const myFront = this.frontRiverX(rule, this.player)
    const opponentFront = this.frontRiverX(rule, otherCorporation(this.player))
    if (myFront !== undefined && free.includes(myFront)) {
      const points = rule.resourcesHelper.points('propaganda')
      const before = this.propagandaSteps(rule, this.player, points, simulation)
      const after = this.propagandaSteps(rule, this.player, points, { ...simulation, slotX: myFront })
      if (after > before) return myFront
    }
    if (opponentFront !== undefined && free.includes(opponentFront)) return opponentFront
    if (myFront !== undefined && free.includes(myFront)) return myFront
    return free[0]
  }

  /** River column of the next card a player's banner has to cross, if it has not reached the end of its track. */
  private frontRiverX(rule: PlayCardsRule, player: Corporation): number | undefined {
    const x = rule.material(MaterialType.Banner).id(player).getItem()?.location.x ?? 0
    const direction = propagandaDirection(rule.game, player)
    const next = x + direction
    if (next < 0 || next > PROPAGANDA_END) return undefined
    return rule.crossedRiverX(x, direction)
  }

  /** Printed crossing cost of the River card in column `x`. */
  private riverCrossingCost(rule: PlayCardsRule, x: number): number {
    const card = rule.river.getItems<SanCard>().find((item) => item.location.x === x)
    return (card && getCardData(card.id)?.crossingCost) ?? 0
  }

  /** Printed crossing cost of the card that will refill the next emptied River slot. */
  private reserveTopCrossingCost(rule: PlayCardsRule): number | undefined {
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
   * otherwise Corruption if it completes a group of 3, otherwise Virus (drawing, then the first
   * option, when the card offers neither).
   */
  private eitherChoiceMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] {
    const moves = legalMoves.filter(isCustomMoveType(CustomMoveType.ChooseEffectOption)) as CustomMove[]
    if (!moves.length) return []
    const itemIndex = (moves[0].data as { itemIndex: number }).itemIndex
    const pending = rule.remind<{ itemIndex: number; options: CardEffect[] }[]>(Memory.PendingEitherChoices) ?? []
    const options = pending.find((choice) => choice.itemIndex === itemIndex)?.options ?? []
    const option = this.bestEitherOption(rule, options)
    return moves.filter((move) => {
      const data = move.data as { itemIndex: number; option: number }
      return data.itemIndex === itemIndex && data.option === option
    })
  }

  private bestEitherOption(rule: PlayCardsRule, options: CardEffect[]): number {
    const find = (type: EffectType) => options.findIndex((effect) => effect.type === type)
    const resources = rule.resourcesHelper

    const propaganda = find(EffectType.Propaganda)
    if (propaganda !== -1) {
      const points = resources.points('propaganda')
      if (this.propagandaSteps(rule, this.player, points + (options[propaganda].value ?? 0)) > this.propagandaSteps(rule, this.player, points)) {
        return propaganda
      }
    }

    const corruption = find(EffectType.Corruption)
    if (corruption !== -1 && rule.freeCorruptionPositions().length) {
      const points = resources.points('corruption')
      if (Math.floor((points + (options[corruption].value ?? 0)) / CORRUPTION_GROUP) > Math.floor(points / CORRUPTION_GROUP)) {
        return corruption
      }
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

  /** Buy the first affordable River card on offer instead of passing; passes when none is affordable. */
  private buyCardsMoves(legalMoves: MaterialMove[]): MaterialMove[] {
    const buyMoves = legalMoves.filter(isMoveItemType(MaterialType.Card))
    return buyMoves.length ? [buyMoves[0]] : legalMoves
  }
}
