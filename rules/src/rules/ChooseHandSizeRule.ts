import { CustomMove, isCustomMoveType, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { Corporation } from '../Corporation'
import { HAND_SIZES } from '../material/constants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { ChooseHandSizeData, CustomMoveType } from './CustomMoveType'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

/**
 * Asymmetric play (the "free" hand size option): before the first turn, each player picks the number
 * of cards their hand is refilled to for the whole game, among {@link HAND_SIZES}. Once both have
 * chosen, each draws that many cards and the starting player, set aside by the setup, takes the first turn.
 */
export class ChooseHandSizeRule extends SimultaneousRule<Corporation, MaterialType, LocationType> {
  getActivePlayerLegalMoves(player: Corporation): MaterialMove[] {
    return HAND_SIZES.map((size) => this.customMove(CustomMoveType.ChooseHandSize, { player, size } satisfies ChooseHandSizeData))
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (!isCustomMoveType(CustomMoveType.ChooseHandSize)(move)) return []
    const { player, size } = move.data as ChooseHandSizeData
    this.memorize(Memory.HandSize, size, player)
    return [this.endPlayerTurn(player)]
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    const moves: MaterialMove[] = this.game.players.map((player) =>
      this.material(MaterialType.Card)
        .location(LocationType.Deck)
        .player(player)
        .deck()
        .dealAtOnce({ type: LocationType.Hand, player }, this.remind<number>(Memory.HandSize, player))
    )
    const startingPlayer = this.remind<Corporation>(Memory.StartingPlayer)
    this.forget(Memory.StartingPlayer)
    moves.push(this.startPlayerTurn(RuleId.PlayCards, startingPlayer))
    return moves
  }
}
