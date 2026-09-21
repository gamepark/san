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

  return { winner: reserveTieBreak(rules), type: VictoryType.Reserve }
}

/** The 3 victory conditions (rules p.22), as opposed to {@link VictoryType.Reserve}. */
export type VictoryCondition = VictoryType.Corruption | VictoryType.Propaganda | VictoryType.Hacking

export const victoryConditions: VictoryCondition[] = [VictoryType.Corruption, VictoryType.Propaganda, VictoryType.Hacking]

/** Cards corrupted (rules p.14), 0..{@link CORRUPTION_WIN}. */
export const corruptedCards = (rules: SanRules, player: Corporation): number =>
  rules.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player).length

/** Steps advanced on a Corporation's own Propaganda track (rules p.16), 0..{@link PROPAGANDA_END}. */
export const propagandaSteps = (rules: SanRules, player: Corporation): number => {
  const direction = propagandaDirection(rules.game, player)
  const bannerX = rules.material(MaterialType.Banner).id(player).getItem()?.location.x ?? 0
  return direction === 1 ? bannerX : PROPAGANDA_END - bannerX
}

/** Virus cards driven off the opponent's pile (rules p.18). */
export const virusCardsDrivenOff = (rules: SanRules, player: Corporation): number => {
  const opponent = otherCorporation(player)
  return virusCards[opponent].length - rules.material(MaterialType.Card).location(LocationType.VirusPile).player(opponent).length
}

/** Spaces the Virus pawn stands on the opponent's current Virus card (0 when it is on the Corporation's own card). */
export const virusPawnAdvance = (rules: SanRules, player: Corporation): number => {
  const pawnX = rules.material(MaterialType.VirusPawn).getItem()?.location.x ?? 0
  return Math.max(0, virusDirection(rules.game, player) * pawnX)
}

/**
 * Each victory condition read as a comparable progress number. For Hacking, one card driven off is
 * weighted above the highest possible partial advance (`virusCardChips(1) = 7`), so it always
 * outweighs any amount of progress still standing on the current one.
 */
const progress: Record<VictoryCondition, (rules: SanRules, player: Corporation) => number> = {
  [VictoryType.Corruption]: corruptedCards,
  [VictoryType.Propaganda]: propagandaSteps,
  [VictoryType.Hacking]: (rules, player) => virusCardsDrivenOff(rules, player) * (virusCardChips(1) + 1) + virusPawnAdvance(rules, player)
}

/** The Corporation most advanced on one victory condition, or 0 if both are level. */
export function conditionLeader(rules: SanRules, condition: VictoryCondition): Corporation | 0 {
  const [a, b] = rules.game.players
  const diff = progress[condition](rules, a) - progress[condition](rules, b)
  return diff > 0 ? a : diff < 0 ? b : 0
}

/**
 * The Reserve ran out (rules p.22): the Corporation most advanced on at least 2 of the 3 victory
 * conditions above wins, otherwise it's a tie. Unlike a single-criterion tie-break cascade (try the
 * next condition only when the previous one is exactly tied), this counts a majority across all
 * three conditions at once, as the rulebook requires.
 */
function reserveTieBreak(rules: SanRules): Corporation | 0 {
  const leaders = victoryConditions.map((condition) => conditionLeader(rules, condition))
  return rules.game.players.find((player) => leaders.filter((leader) => leader === player).length >= 2) ?? 0
}
