import { PlayMoveButton, useLegalMoves, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { SanRules } from '@gamepark/san/SanRules'
import { isCustomMoveType } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

/**
 * "Terminer" auto-plays after 10s when it's the only legal move left — no River card affordable
 * anymore this phase. PlayMoveButton's own `auto` prop drives the countdown and its display, same
 * technique as living-forest-duel's UseSankiCardHeader. (BuyCardsRule.onRuleStart already skips the
 * whole phase server-side when nothing was ever affordable; this covers becoming stuck mid-phase.)
 */
export const BuyCardsHeader = () => {
  const me = usePlayerId()
  const rules = useRules<SanRules>()!
  const active = rules.game.rule?.player
  const player = usePlayerName(active)
  const moves = useLegalMoves()
  const end = moves.find(isCustomMoveType(CustomMoveType.EndBuyPhase))
  const stuck = end !== undefined && moves.length === 1

  if (me === undefined || active !== me) {
    return <Trans i18nKey="header.buy.player" values={{ player }} />
  }
  return <Trans i18nKey="header.buy.you" components={{ end: <PlayMoveButton move={end} auto={stuck ? 10 : undefined} /> }} />
}
