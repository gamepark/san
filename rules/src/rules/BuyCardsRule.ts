import { CustomMove, isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { getCardData } from '../material/CardsData'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { SanCard } from '../material/SanCard'
import { CustomMoveType } from './CustomMoveType'
import { Memory } from './Memory'
import { RuleId } from './RuleId'
import { SanRule } from './SanRule'

/**
 * Turn phase 2 — "Buy one or more cards" (optional).
 *
 * The revenue of every card played this turn is banked in {@link Memory.Coins}; that is the buying
 * income. It buys cards from the River (only), one at a time, as long as the income covers the
 * card's {@link import('../material/CardsData').CardData.cost}. A bought card goes to the discard and
 * its River slot is refilled from the Reserve — cards revealed that way can be bought in turn.
 * Unused income is dropped at end of turn ({@link import('./EndTurnRule').EndTurnRule}).
 *
 * If the River cannot be refilled because the Reserve is empty, the game ends immediately.
 */
export class BuyCardsRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    return this.affordableCards().length ? [] : [this.startRule(RuleId.EndTurn)]
  }

  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = this.affordableCards().map((index) =>
      this.material(MaterialType.Card).index(index).moveItem({ type: LocationType.Discard, player: this.player })
    )
    moves.push(this.customMove(CustomMoveType.EndBuyPhase))
    return moves
  }

  /** Item indexes of the River cards the current buying income can afford. */
  affordableCards(): number[] {
    const coins = this.points(Memory.Coins)
    return this.river.getIndexes().filter((index) => {
      const cost = getCardData(this.material(MaterialType.Card).getItem<SanCard>(index).id)?.cost
      return cost !== undefined && cost <= coins
    })
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Discard) {
      const cost = getCardData(this.material(MaterialType.Card).getItem<SanCard>(move.itemIndex).id)?.cost ?? 0
      this.memorize<number>(Memory.Coins, (value) => Math.max(0, (value ?? 0) - cost), this.player)
      // Refill the emptied River slot; an empty Reserve ends the game (rules, p.13).
      return this.reserve.length ? [this.reserve.deck().dealOne({ type: LocationType.River })] : [this.endGame()]
    }
    return []
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (move.type === CustomMoveType.EndBuyPhase) return [this.startRule(RuleId.EndTurn)]
    return []
  }
}
