import {
  CompetitiveRank,
  CustomMove,
  FillGapStrategy,
  HidingStrategy,
  hideItemId,
  hideItemIdToOthers,
  isMoveItemType,
  ItemMove,
  MaterialGame,
  MaterialMove,
  PlayMoveContext,
  PositiveSequenceStrategy,
  SecretMaterialRules,
  TimeLimit
} from '@gamepark/rules-api'
import { Corporation } from './Corporation'
import { isVirusCard } from './material/CardsData'
import { CORRUPTION_WIN, PROPAGANDA_END } from './material/constants'
import { LocationType } from './material/LocationType'
import { SanCard } from './material/SanCard'
import { MaterialType } from './material/MaterialType'
import { BuyCardsRule } from './rules/BuyCardsRule'
import { ChooseHandSizeRule } from './rules/ChooseHandSizeRule'
import { CustomMoveType, DrawData } from './rules/CustomMoveType'
import { EndTurnRule } from './rules/EndTurnRule'
import { propagandaDirection } from './rules/helper/directions'
import { victoryOutcome } from './rules/helper/victory'
import { PlayCardsRule } from './rules/PlayCardsRule'
import { RuleId } from './rules/RuleId'

/** The Reserve is face down, except its top card, which the rules rotate (`rotation: true`). */
const hideItemIdUnlessRotated: HidingStrategy = (item) => (item.location.rotation ? [] : ['id'])

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class SanRules
  extends SecretMaterialRules<Corporation, MaterialType, LocationType>
  implements
    TimeLimit<MaterialGame<Corporation, MaterialType, LocationType>, MaterialMove<Corporation, MaterialType, LocationType>, Corporation>,
    CompetitiveRank<MaterialGame<Corporation, MaterialType, LocationType>, MaterialMove<Corporation, MaterialType, LocationType>, Corporation>
{
  rules = {
    [RuleId.PlayCards]: PlayCardsRule,
    [RuleId.BuyCards]: BuyCardsRule,
    [RuleId.EndTurn]: EndTurnRule,
    [RuleId.ChooseHandSize]: ChooseHandSizeRule
  }

  locationsStrategies = {
    [MaterialType.Card]: {
      [LocationType.Deck]: new PositiveSequenceStrategy(),
      [LocationType.Discard]: new PositiveSequenceStrategy(),
      [LocationType.Hand]: new PositiveSequenceStrategy(),
      [LocationType.PlayArea]: new PositiveSequenceStrategy(),
      [LocationType.Reserve]: new PositiveSequenceStrategy(),
      [LocationType.VirusPile]: new PositiveSequenceStrategy(),
      [LocationType.River]: new FillGapStrategy()
    }
  }

  hidingStrategies = {
    [MaterialType.Card]: {
      [LocationType.Deck]: hideItemId,
      [LocationType.Hand]: hideItemIdToOthers,
      [LocationType.CorruptionZone]: hideItemId,
      [LocationType.Reserve]: hideItemIdUnlessRotated
    }
  }

  protected afterItemMove(move: ItemMove): MaterialMove[] {
    // Corruption victory: 12 cards in the Corruption zone.
    if (isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.CorruptionZone) {
      const player = move.location.player
      if (player !== undefined && this.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player).length >= CORRUPTION_WIN) {
        return [this.endGame()]
      }
    }

    // Propaganda victory: banner reached the far end of its track.
    if (isMoveItemType(MaterialType.Banner)(move) && move.location.type === LocationType.PropagandaTrack) {
      const player = move.location.player
      if (player !== undefined) {
        const direction = propagandaDirection(this.game, player)
        if ((direction === 1 && move.location.x === PROPAGANDA_END) || (direction === -1 && move.location.x === 0)) {
          return [this.endGame()]
        }
      }
    }

    // Hacking victory: the Virus pawn drove the opponent's last Virus card off onto their deck.
    if (isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Deck && move.location.player !== undefined) {
      const card = this.material(MaterialType.Card).getItem<SanCard>(move.itemIndex)
      if (isVirusCard(card.id) && this.material(MaterialType.Card).location(LocationType.VirusPile).player(move.location.player).length === 0) {
        return [this.endGame()]
      }
    }

    return super.afterItemMove(move)
  }

  protected onCustomMove(move: CustomMove, context?: PlayMoveContext): MaterialMove[] {
    const moves = super.onCustomMove(move, context)
    if (move.type === CustomMoveType.Draw) moves.push(...this.draw(move.data as DrawData))
    return moves
  }

  /**
   * Deal up to `quantity` cards from the deck to the hand. As soon as the deck is empty — even when
   * it held exactly the cards needed — the discard is shuffled into a new deck, then the rest is drawn.
   */
  private draw({ player, quantity }: DrawData): MaterialMove[] {
    const moves: MaterialMove[] = []
    const deck = this.material(MaterialType.Card).location(LocationType.Deck).player(player).deck()
    const dealt = Math.min(quantity, deck.length)
    const emptied = dealt === deck.length
    if (dealt > 0) moves.push(deck.dealAtOnce({ type: LocationType.Hand, player }, dealt))
    if (emptied) {
      const discard = this.material(MaterialType.Card).location(LocationType.Discard).player(player)
      if (discard.length > 0) {
        moves.push(discard.moveItemsAtOnce({ type: LocationType.Deck, player }), discard.shuffle())
        if (quantity > dealt) moves.push(this.customMove(CustomMoveType.Draw, { player, quantity: quantity - dealt } satisfies DrawData))
      }
    }
    return moves
  }

  /**
   * Who wins is derived from the final board state (rules p.22), not memorized — see {@link
   * import('./rules/helper/victory').victoryOutcome}.
   */
  rankPlayers(playerA: Corporation, playerB: Corporation): number {
    const { winner } = victoryOutcome(this)
    if (winner === playerA) return -1
    if (winner === playerB) return 1
    return 0
  }

  giveTime(): number {
    return 60
  }
}
