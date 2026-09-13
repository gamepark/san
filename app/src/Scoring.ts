import { ScoringDescription } from '@gamepark/react-game'
import { Corporation } from '@gamepark/san/Corporation'
import { SanRules } from '@gamepark/san/SanRules'
import { GameOverHeader } from './headers/GameOverHeader'

/**
 * San has no numeric score (just a win/lose/tie outcome, {@link SanRules.rankPlayers}), so the
 * scoring table itself stays empty — this is only here to plug {@link GameOverHeader} as the result
 * text, shown consistently in the header and in the "Result" dialog (`ScoringDescription.ResultHeader`
 * is read by both; the deprecated `MaterialHeader.GameOver` prop only covers the header).
 */
export const Scoring: ScoringDescription<Corporation, SanRules> = {
  getScoringKeys: () => [],
  getScoringHeader: () => '',
  getScoringPlayerData: () => null,
  ResultHeader: GameOverHeader
}
