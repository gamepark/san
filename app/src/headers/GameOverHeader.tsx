import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { Corporation } from '@gamepark/san/Corporation'
import { victoryOutcome } from '@gamepark/san/rules/helper/victory'
import { SanRules } from '@gamepark/san/SanRules'
import { Trans, useTranslation } from 'react-i18next'
import { reasonKey } from './reasonKey'

export const GameOverHeader = () => {
  const me = usePlayerId<Corporation>()
  const rules = useRules<SanRules>()!
  const { winner, type } = victoryOutcome(rules)
  const winnerName = usePlayerName(winner || undefined)
  const { t } = useTranslation()

  if (!winner) {
    return <>{t('header.game-over.tie')}</>
  }
  const reason = reasonKey[type]
  if (winner === me) {
    return <>{t(`header.game-over.you.${reason}`)}</>
  }
  return <Trans i18nKey={`header.game-over.player.${reason}`} values={{ player: winnerName }} />
}
