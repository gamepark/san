import { MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { SanRule } from '../SanRule'

/**
 * Draw {@link Memory.DrawCount} cards, one per pass, reshuffling the discard into the deck when it
 * runs out. When done it drops the {@link import('./RuleId').RuleId.DrawCards}-triggering effect and
 * returns to {@link RuleId.ResolveEffects}.
 */
export class DrawCardsRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    const remaining = this.remind<number>(Memory.DrawCount) ?? 0
    if (remaining <= 0) return this.done()

    if (this.deck.length === 0) {
      if (this.discard.length === 0) return this.done() // nothing left to draw
      return [
        this.discard.moveItemsAtOnce({ type: LocationType.Deck, player: this.player }),
        this.discard.shuffle(),
        this.startRule(RuleId.DrawCards)
      ]
    }

    this.memorize(Memory.DrawCount, remaining - 1)
    return [this.deck.deck().dealOne({ type: LocationType.Hand, player: this.player }), this.startRule(RuleId.DrawCards)]
  }

  done(): MaterialMove[] {
    this.forget(Memory.DrawCount)
    return this.finishCurrentEffect()
  }
}
