import { MaterialMove } from '@gamepark/rules-api'
import { HAND_SIZE } from '../material/constants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from './Memory'
import { RuleId } from './RuleId'
import { SanRule } from './SanRule'

/**
 * End of turn (mandatory phases 3 & 4): discard the played cards (Single Use cards are removed from
 * the game — back to the box, physically), refill the hand (see {@link SanRule.drawCards}),
 * then pass to the opponent.
 *
 * Runs after the optional {@link import('./RuleId').RuleId.BuyCards} phase; any coins left unspent
 * there are dropped in {@link nextTurn}.
 */
export class EndTurnRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    const player = this.player
    const singleUse = this.turnFlagsHelper.flags.singleUseCards
    this.turnFlagsHelper.reset()
    const moves: MaterialMove[] = this.playArea.index((index) => singleUse.includes(index)).deleteItems()
    const toDiscard = this.playArea.index((index) => !singleUse.includes(index))
    if (toDiscard.length) moves.push(toDiscard.moveItemsAtOnce({ type: LocationType.Discard, player }))
    // The draw is resolved when played, after the discard above: a reshuffle then includes the cards played this turn.
    const deficit = this.handSize - this.hand.length
    if (deficit > 0) moves.push(this.drawCards(player, deficit))
    moves.push(...this.nextTurn())
    return moves
  }

  nextTurn(): MaterialMove[] {
    this.resourcesHelper.clear()
    return [this.startPlayerTurn(RuleId.PlayCards, this.nextPlayer)]
  }

  /** 6 cards (7 with the "first game" option, rules p.10), plus one for each collected Hand Bonus token. */
  get handSize(): number {
    const base = HAND_SIZE + (this.remind<boolean>(Memory.FirstGame) ? 1 : 0)
    return base + this.material(MaterialType.HandBonusToken).location(LocationType.PlayerHandBonus).player(this.player).length
  }
}
