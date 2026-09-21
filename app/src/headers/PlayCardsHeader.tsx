import { useLegalMoves, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { SanRules } from '@gamepark/san/SanRules'
import { isCustomMoveType } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { EndPlayPhaseButton } from './EndPlayPhaseButton'

/**
 * "Terminer" auto-plays after 10s when it's the only legal move left — no card playable, nothing
 * banked to spend (see PlayCardsRule.getPlayerMoves, which offers it in that case even with no card
 * played this turn). PlayMoveButton's own `auto` prop drives the countdown and its display, same
 * technique as living-forest-duel's UseSankiCardHeader. While effects remain usable, "passez" asks for
 * confirmation first (see EndPlayPhaseButton).
 */
export const PlayCardsHeader = () => {
  const me = usePlayerId()
  const rules = useRules<SanRules>()!
  const active = rules.game.rule?.player
  const player = usePlayerName(active)
  const moves = useLegalMoves()
  const end = moves.find(isCustomMoveType(CustomMoveType.EndPlayPhase))
  const stuck = end !== undefined && moves.length === 1

  if (me === undefined || active !== me) {
    return <Trans i18nKey="header.play.player" values={{ player }} />
  }
  return <Trans i18nKey="header.play.you" components={{ end: <EndPlayPhaseButton move={end} auto={stuck ? 10 : undefined} /> }} />
}
