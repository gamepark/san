import { CustomMove, isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { getCardData } from '../../material/CardsData'
import { CardType, SanCard } from '../../material/SanCard'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { CustomMoveType } from '../CustomMoveType'
import { SanRule } from '../SanRule'

/**
 * "Play a card from your discard": the player may pick one card of their discard and play it (its
 * effects then resolve like any other played card). The one-Mercenary-type restriction still applies.
 */
export class PlayFromDiscardRule extends SanRule {
  onRuleStart(): MaterialMove[] {
    return this.playableDiscardIndexes().length === 0 ? this.finishCurrentEffect() : []
  }

  getPlayerMoves(): MaterialMove[] {
    const moves: MaterialMove[] = this.playableDiscardIndexes().map((index) =>
      this.material(MaterialType.Card).index(index).moveItem({ type: LocationType.PlayArea, player: this.player })
    )
    moves.push(this.customMove(CustomMoveType.Pass))
    return moves
  }

  playableDiscardIndexes(): number[] {
    return this.discard.getIndexes().filter((index) => {
      const data = getCardData(this.material(MaterialType.Card).getItem<SanCard>(index).id)
      if (!data) return false
      return data.type === CardType.Equipment || this.mercenaryTypePlayable(data.type)
    })
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemType(MaterialType.Card)(move) || move.location.type !== LocationType.PlayArea) return []
    // Drop the "play from discard" effect, then queue the played card's own effects in front.
    const queue = this.effectQueue
    queue.shift()
    this.setQueue(queue)
    return this.playCardEffects(move.itemIndex)
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    return move.type === CustomMoveType.Pass ? this.finishCurrentEffect() : []
  }
}
