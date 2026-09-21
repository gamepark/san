import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { SanRules } from '@gamepark/san/SanRules'
import { useTranslation } from 'react-i18next'

/** Automatic phase (discard the played cards, refill the hand): shown while its animations play. */
export const EndTurnHeader = () => {
  const { t } = useTranslation()
  const me = usePlayerId()
  const rules = useRules<SanRules>()!
  const active = rules.game.rule?.player
  const player = usePlayerName(active)

  if (me === undefined || active !== me) {
    return <>{t('header.end-turn.player', { player })}</>
  }
  return <>{t('header.end-turn.you')}</>
}
