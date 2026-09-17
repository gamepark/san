import { MaterialGame } from '@gamepark/rules-api'
import { Corporation } from '../../Corporation'

/**
 * Direction a Corporation moves its banner along the (shared) Propaganda track. Fixed by Corporation
 * identity, like {@link virusDirection} below — not by seat order, which has no reason to match which
 * Corporation a player picked (see {@link import('../../SanSetup').SanSetup.setupPropagandaTracks}; the
 * app mirrors the track when Moon is displayed at the bottom, see {@link
 * import('../../../app/src/locators/SanLayout').riverDirection}).
 * Moon starts at step 0 and moves towards {@link import('../../material/constants').PROPAGANDA_END};
 * Star starts at PROPAGANDA_END and moves the other way.
 */
export const propagandaDirection = (_game: MaterialGame, player: Corporation): 1 | -1 => (player === Corporation.Moon ? 1 : -1)

/**
 * Direction a Corporation "advances" the Virus pawn (towards the opponent's Virus cards).
 * Moon sits on the negative side of the track, Star on the positive side.
 */
export const virusDirection = (_game: MaterialGame, player: Corporation): 1 | -1 => (player === Corporation.Moon ? 1 : -1)
