import { MaterialGame } from '@gamepark/rules-api'
import { Corporation } from '../../Corporation'

/**
 * Direction a Corporation moves its banner along the (shared) Propaganda track.
 * The two Corporations sit on opposite sides of the table and both move "to their right":
 * the first player goes 0 → {@link import('../../material/constants').PROPAGANDA_END}, the second the other way.
 */
export const propagandaDirection = (game: MaterialGame, player: Corporation): 1 | -1 => (game.players[0] === player ? 1 : -1)

/**
 * Direction a Corporation "advances" the Virus pawn (towards the opponent's Virus cards).
 * Moon sits on the negative side of the track, Star on the positive side.
 */
export const virusDirection = (_game: MaterialGame, player: Corporation): 1 | -1 => (player === Corporation.Moon ? 1 : -1)
