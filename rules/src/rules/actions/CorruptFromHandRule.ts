import { CustomMove, isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { CustomMoveType } from '../CustomMoveType'
import { Memory } from '../Memory'
import { SanRule } from '../SanRule'

/**
 * "Corrupt a card from your hand": the player may move up to {@link Memory.EffectRepeat} hand cards
 * into a free Corruption slot (no group-of-3 cost). Optional, so a "pass" is offered.
 */
export class CorruptFromHandRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    return this.hand.length === 0 || this.freeCorruptionPositions().length === 0 ? this.finish() : []
  }

  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = []
    for (const position of this.freeCorruptionPositions()) {
      moves.push(
        ...this.hand.moveItems({ type: LocationType.CorruptionZone, player: this.player, x: position.x, y: position.y })
      )
    }
    moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.Card)(move) || move.location.type !== LocationType.CorruptionZone) return []
    const remaining = (this.remind<number>(Memory.EffectRepeat) ?? 1) - 1
    if (remaining <= 0 || this.hand.length === 0 || this.freeCorruptionPositions().length === 0) return this.finish()
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
