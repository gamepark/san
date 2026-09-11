import { CustomMove, MaterialMove } from '@gamepark/rules-api'
import { CustomMoveType } from '../CustomMoveType'
import { RuleId } from '../RuleId'
import { SanRule } from '../SanRule'

/**
 * "Either / or" effect: the player picks one side. The chosen sub-effect replaces the `Either` at the
 * front of the queue and control returns to {@link RuleId.ResolveEffects}.
 */
export class ChooseEffectRule extends SanRule {
  getPlayerMoves(): MaterialMove[] {
    const either = this.effectQueue[0]
    if (!either?.option) return []
    return either.option.map((_, index) => this.customMove(CustomMoveType.ChooseEffectOption, index))
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (move.type !== CustomMoveType.ChooseEffectOption) return []
    const queue = this.effectQueue
    const either = queue.shift()
    const chosen = either?.option?.[move.data as number]
    if (chosen) queue.unshift(chosen)
    this.setQueue(queue)
    return [this.startRule(RuleId.ResolveEffects)]
  }
}
