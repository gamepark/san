import { CustomMove, isDeleteItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { CustomMoveType } from '../CustomMoveType'
import { Memory } from '../Memory'
import { SanRule } from '../SanRule'

/**
 * "Destroy a card": the player may send up to {@link Memory.EffectRepeat} cards from hand to the box.
 * The box has no drop zone on the table, so the card is simply deleted on a short click (see
 * {@link import('../../../app/src/material/SanCardDescription').SanCardDescription.canShortClick}).
 * The effect is optional, so a "pass" is always available.
 */
export class DestroyCardRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    return this.hand.length === 0 ? this.finish() : []
  }

  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = this.hand.deleteItems()
    moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isDeleteItemType(MaterialType.Card)(move)) return []
    const remaining = (this.remind<number>(Memory.EffectRepeat) ?? 1) - 1
    if (remaining <= 0 || this.hand.length === 0) return this.finish()
    this.memorize(Memory.EffectRepeat, remaining)
    return []
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    return move.type === CustomMoveType.Pass ? this.finish() : []
  }

  finish(): MaterialMove[] {
    this.forget(Memory.EffectRepeat)
    return this.finishCurrentEffect()
  }
}
