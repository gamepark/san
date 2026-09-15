import { CustomMove, MaterialMove } from '@gamepark/rules-api'
import { CardEffect, EffectType, getCardData, isMercenaryType } from '../../material/CardsData'
import { SanCard } from '../../material/SanCard'
import { MaterialType } from '../../material/MaterialType'
import { clone } from '../clone'
import { CustomMoveType } from '../CustomMoveType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { SanRule } from '../SanRule'

/**
 * "Copy a card of the River": the player picks a River card and adopts its type and effects. If the
 * copied card is Single Use, that applies to the card doing the copying.
 */
export class CopyRiverRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    return this.copyableIndexes().length === 0 ? this.finishCurrentEffect() : []
  }

  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = this.copyableIndexes().map((index) => this.customMove(CustomMoveType.CopyRiverCard, index))
    moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  copyableIndexes(): number[] {
    return this.river.getIndexes().filter((index) => {
      const data = getCardData(this.material(MaterialType.Card).getItem<SanCard>(index).id)
      if (!data) return false
      return !isMercenaryType(data.type) || this.turnFlagsHelper.mercenaryTypePlayable(data.type)
    })
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (move.type === CustomMoveType.Pass) return this.finishCurrentEffect()
    if (move.type !== CustomMoveType.CopyRiverCard) return []

    const id = this.material(MaterialType.Card).getItem<SanCard>(move.data as number).id
    const data = getCardData(id)!

    if (isMercenaryType(data.type)) this.turnFlagsHelper.lockMercenaryType(data.type)

    const effects: CardEffect[] = clone(data.effects)
    if (effects.some((effect) => effect.type === EffectType.SingleUse)) {
      const copyingCard = this.remind<number>(Memory.ResolvingCardIndex)
      if (copyingCard !== undefined) this.turnFlagsHelper.addSingleUseCard(copyingCard)
    }

    const queue = this.effectQueue
    queue.shift() // remove the CopyRiver effect
    queue.unshift(...effects.filter((effect) => effect.type !== EffectType.SingleUse))
    this.setQueue(queue)
    return [this.startRule(RuleId.ResolveEffects)]
  }
}
