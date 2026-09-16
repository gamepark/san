import { isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove, RandomBot } from '@gamepark/rules-api'
import { Corporation } from './Corporation'
import { getCardData, isMercenaryType } from './material/CardsData'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CardType, SanCard } from './material/SanCard'
import { CustomMoveType } from './rules/CustomMoveType'
import { virusDirection } from './rules/helper/directions'
import { PlayCardsRule } from './rules/PlayCardsRule'
import { RuleId } from './rules/RuleId'
import { SanRules } from './SanRules'

/**
 * A simple heuristic opponent, used as the tutorial / "monkey opponents" bot: it spends banked
 * resources on a victory condition (rules p.22 — Corruption / Propaganda / Hacking) the instant it
 * can, and otherwise buys the first River card it can afford rather than passing.
 */
export class SanBot extends RandomBot<MaterialGame<Corporation, MaterialType, LocationType>, MaterialMove<Corporation, MaterialType, LocationType>, Corporation> {
  constructor(playerId: Corporation) {
    super(SanRules, playerId)
  }

  override getLegalMoves(game: MaterialGame<Corporation, MaterialType, LocationType>): MaterialMove<Corporation, MaterialType, LocationType>[] {
    const legalMoves = super.getLegalMoves(game)
    switch (game.rule?.id) {
      case RuleId.PlayCards:
        return this.playCardsMoves(game, legalMoves)
      case RuleId.BuyCards:
        return this.buyCardsMoves(legalMoves)
      default:
        return legalMoves
    }
  }

  /**
   * Whenever at least one legal move actually advances a victory condition, only consider those,
   * ahead of playing another card or ending the phase: a turn's banked resources are wiped the
   * moment the next PlayCards phase starts fresh (see {@link PlayCardsRule.onRuleStart}), so
   * anything spendable now and left unspent this turn is lost for good.
   */
  private playCardsMoves(game: MaterialGame<Corporation, MaterialType, LocationType>, legalMoves: MaterialMove[]): MaterialMove[] {
    const rule = new PlayCardsRule(game)
    const victoryMoves = legalMoves.filter((move) => this.isVictoryMove(rule, move))
    if (victoryMoves.length) return victoryMoves
    // The first Mercenary card played locks the turn to its type (see TurnFlagsHelper.lockMercenaryType):
    // committing to whichever type has the most cards in hand lets the most of them actually get
    // played, rather than locking in after a single card and stranding a bigger combo of another type.
    const bestTypeMoves = this.bestMercenaryTypeMoves(rule, legalMoves)
    if (bestTypeMoves) return bestTypeMoves
    // Never voluntarily end the phase while another card can still be played (a Virus card straight
    // to the discard, an Equipment, or a same-type Mercenary once the turn is locked to it): playing
    // it never hurts — more revenue, more banked resources — and it may still reach a threshold this
    // turn (e.g. enough Corruption or Propaganda points to finally afford the group / crossing cost).
    const otherMoves = legalMoves.filter((move) => !isCustomMoveType(CustomMoveType.EndPlayPhase)(move))
    return otherMoves.length ? otherMoves : legalMoves
  }

  /**
   * Only meaningful before any Mercenary type is locked for the turn (or lifted by "play every type
   * you want" — see TurnFlagsHelper.mercenaryTypePlayable): groups the still-untyped hand's legal
   * Mercenary plays by {@link CardType} and returns the largest group, so the type committed to is
   * the one that lets the most cards actually get played this turn. On a tie, Hacking wins it: its
   * points are spent one at a time (see virusMoves()), so unlike a Corruption group of 3 or a
   * variable Propaganda crossing cost, none of them can end up banked and wasted.
   */
  private bestMercenaryTypeMoves(rule: PlayCardsRule, legalMoves: MaterialMove[]): MaterialMove[] | undefined {
    const flags = rule.turnFlagsHelper.flags
    if (flags.playedMercenaryType !== undefined || flags.allTypesAllowed) return undefined
    const movesByType = new Map<CardType, MaterialMove[]>()
    for (const move of legalMoves) {
      if (!isMoveItemType(MaterialType.Card)(move) || move.location.type !== LocationType.PlayArea) continue
      const id = rule.material(MaterialType.Card).getItem<SanCard>(move.itemIndex).id
      const data = id !== undefined ? getCardData(id) : undefined
      if (!data || !isMercenaryType(data.type)) continue
      const moves = movesByType.get(data.type) ?? []
      moves.push(move)
      movesByType.set(data.type, moves)
    }
    if (!movesByType.size) return undefined
    const maxCount = Math.max(...[...movesByType.values()].map((moves) => moves.length))
    const hackingMoves = movesByType.get(CardType.Hacking)
    if (hackingMoves?.length === maxCount) return hackingMoves
    return [...movesByType.values()].find((moves) => moves.length === maxCount)
  }

  private isVictoryMove(rule: PlayCardsRule, move: MaterialMove): boolean {
    if (isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.CorruptionZone) return true
    if (isMoveItemType(MaterialType.Banner)(move) && move.location.type === LocationType.PropagandaTrack) return true
    if (isMoveItemType(MaterialType.VirusPawn)(move) && move.location.type === LocationType.VirusTrack) {
      return move.location.x === this.virusAdvanceTarget(rule)
    }
    return false
  }

  /**
   * The one target among {@link PlayCardsRule.virusMoves} that actually progresses this player's
   * Hacking score (advancing towards, or driving off, the opponent's top Virus card). The other
   * candidate target — retreating towards this player's own Virus card — only helps the opponent,
   * so it is never picked as a "victory" move here.
   */
  private virusAdvanceTarget(rule: PlayCardsRule): number | undefined {
    const pawn = rule.material(MaterialType.VirusPawn).getItem()
    if (!pawn) return undefined
    const x = pawn.location.x ?? 0
    const dir = virusDirection(rule.game, rule.player)
    const oppChips = rule.virusChips(rule.virusOpponent)
    return x === dir * oppChips ? 0 : x + dir
  }

  /** Buy the first affordable River card on offer instead of passing; passes when none is affordable. */
  private buyCardsMoves(legalMoves: MaterialMove[]): MaterialMove[] {
    const buyMoves = legalMoves.filter(isMoveItemType(MaterialType.Card))
    return buyMoves.length ? [buyMoves[0]] : legalMoves
  }
}
