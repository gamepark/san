import { MaterialMove } from '@gamepark/rules-api'
import { HAND_SIZE } from '../material/constants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from './Memory'
import { RuleId } from './RuleId'
import { SanRule } from './SanRule'

/**
 * End of turn (mandatory phases 3 & 4): discard the played cards (Single Use cards are removed from
 * the game — back to the box, physically), refill the hand — reshuffling the discard if needed —
 * then pass to the opponent.
 *
 * Runs after the optional {@link import('./RuleId').RuleId.BuyCards} phase; any {@link Memory.Coins}
 * left unspent there are dropped in {@link nextTurn}.
 */
export class EndTurnRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    const player = this.player

    if (!this.remind(Memory.TurnDiscarded)) {
      this.memorize(Memory.TurnDiscarded, true)
      const singleUse = this.remind<number[]>(Memory.SingleUseCards) ?? []
      const moves: MaterialMove[] = []
      const toBox = this.playArea.index((index) => singleUse.includes(index))
      if (toBox.length) moves.push(...toBox.deleteItems())
      const toDiscard = this.playArea.index((index) => !singleUse.includes(index))
      if (toDiscard.length) moves.push(toDiscard.moveItemsAtOnce({ type: LocationType.Discard, player }))
      moves.push(this.startRule(RuleId.EndTurn))
      return moves
    }

    const deficit = this.handSize - this.hand.length
    if (deficit > 0) {
      if (this.deck.length === 0) {
        if (this.discard.length === 0) return this.nextTurn()
        return [
          this.discard.moveItemsAtOnce({ type: LocationType.Deck, player }),
          this.discard.shuffle(),
          this.startRule(RuleId.EndTurn)
        ]
      }
      const dealt = Math.min(deficit, this.deck.length)
      return [this.deck.deck().dealAtOnce({ type: LocationType.Hand, player }, dealt), this.startRule(RuleId.EndTurn)]
    }

    return this.nextTurn()
  }

  nextTurn(): MaterialMove[] {
    this.forget(Memory.TurnDiscarded)
    // Unspent resources are lost at end of turn: clear the panels of the player who just played.
    for (const key of [Memory.CorruptionPoints, Memory.PropagandaPoints, Memory.VirusPoints, Memory.Coins, Memory.FlexPoints] as const) {
      this.memorize(key, 0, this.player)
    }
    return [this.startPlayerTurn(RuleId.PlayCards, this.nextPlayer)]
  }

  /** 6 cards, plus one for each collected Hand Bonus token. */
  get handSize(): number {
    return HAND_SIZE + this.material(MaterialType.HandBonusToken).location(LocationType.PlayerHandBonus).player(this.player).length
  }
}
