import { Corporation, otherCorporation } from '../../Corporation'
import { CORRUPTION_WIN, PROPAGANDA_END, virusCardChips } from '../../material/constants'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { virusCards } from '../../material/SanCard'
import type { SanRules } from '../../SanRules'
import { VictoryType } from '../VictoryType'
import { propagandaDirection, virusDirection } from './directions'

export interface VictoryOutcome {
  winner: Corporation | 0
  type: VictoryType
}

/**
 * How the game ended (rules p.22), derived entirely from the final board state — nothing needs to
 * be memorized while the game is being played. The three explicit victory conditions each end the
 * game immediately the instant they are met ({@link import('../../SanRules').SanRules.afterItemMove}),
 * so they are mutually exclusive with the Reserve running out: once the game is over, if none of
 * them holds, the Reserve must be the reason.
 */
export function victoryOutcome(rules: SanRules): VictoryOutcome {
  const [a, b] = rules.game.players

  for (const player of [a, b]) {
    if (rules.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player).length >= CORRUPTION_WIN) {
      return { winner: player, type: VictoryType.Corruption }
    }
  }

  for (const player of [a, b]) {
    const x = rules.material(MaterialType.Banner).id(player).getItem()?.location.x ?? 0
    const direction = propagandaDirection(rules.game, player)
    if ((direction === 1 && x === PROPAGANDA_END) || (direction === -1 && x === 0)) {
      return { winner: player, type: VictoryType.Propaganda }
    }
  }

  for (const player of [a, b]) {
    if (rules.material(MaterialType.Card).location(LocationType.VirusPile).player(player).length === 0) {
      // The Corporation whose pile just emptied is the one attacked, not the winner.
      return { winner: otherCorporation(player), type: VictoryType.Hacking }
    }
  }

  return { winner: reserveTieBreak(rules, a, b), type: VictoryType.Reserve }
}

/** One of the 3 victory conditions (rules p.22), read as a comparable progress number. */
type VictoryCondition = (rules: SanRules, player: Corporation) => number

/** Cards corrupted (rules p.14), 0..{@link CORRUPTION_WIN}. */
const corruptionProgress: VictoryCondition = (rules, player) =>
  rules.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player).length

/** Steps advanced on a Corporation's own Propaganda track (rules p.16), 0..{@link PROPAGANDA_END}. */
const propagandaProgress: VictoryCondition = (rules, player) => {
  const direction = propagandaDirection(rules.game, player)
  const bannerX = rules.material(MaterialType.Banner).id(player).getItem()?.location.x ?? 0
  return direction === 1 ? bannerX : PROPAGANDA_END - bannerX
}

/**
 * Virus cards driven off the opponent's pile (rules p.18), with the pawn's current position on the
 * opponent's card as a finer-grained tie-breaker. One card driven off is weighted above the highest
 * possible partial advance (`virusCardChips(1) = 7`), so it always outweighs any amount of progress
 * still standing on the current one.
 */
const hackingProgress: VictoryCondition = (rules, player) => {
  const opponent = otherCorporation(player)
  const cardsDrivenOff = virusCards[opponent].length - rules.material(MaterialType.Card).location(LocationType.VirusPile).player(opponent).length
  const pawnX = rules.material(MaterialType.VirusPawn).getItem()?.location.x ?? 0
  const partialAdvance = Math.max(0, virusDirection(rules.game, player) * pawnX)
  return cardsDrivenOff * (virusCardChips(1) + 1) + partialAdvance
}

const victoryConditions: VictoryCondition[] = [corruptionProgress, propagandaProgress, hackingProgress]

/**
 * The Reserve ran out (rules p.22): the Corporation most advanced on at least 2 of the 3 victory
 * conditions above wins, otherwise it's a tie. Unlike a single-criterion tie-break cascade (try the
 * next condition only when the previous one is exactly tied), this counts a majority across all
 * three conditions at once, as the rulebook requires.
 */
function reserveTieBreak(rules: SanRules, a: Corporation, b: Corporation): Corporation | 0 {
  let aLeads = 0
  let bLeads = 0
  for (const progress of victoryConditions) {
    const diff = progress(rules, a) - progress(rules, b)
    if (diff > 0) aLeads++
    else if (diff < 0) bLeads++
  }
  if (aLeads >= 2) return a
  if (bLeads >= 2) return b
  return 0
}
