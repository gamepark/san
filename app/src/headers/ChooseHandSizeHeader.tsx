import { useLegalMoves, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { SanRules } from '@gamepark/san/SanRules'
import { isCustomMoveType } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

/** "Free" hand size option: both players pick their hand size at once, in {@link import('./ChooseHandSizeDialog').ChooseHandSizeDialog}. */
export const ChooseHandSizeHeader = () => {
  const { t } = useTranslation()
  const me = usePlayerId()
  const rules = useRules<SanRules>()!
  const waiting = rules.game.rule?.players ?? []
  const player = usePlayerName(waiting[0])
  const choosing = useLegalMoves(isCustomMoveType(CustomMoveType.ChooseHandSize)).length > 0

  if (choosing) return <>{t('header.hand-size.you')}</>
  if (me !== undefined && waiting.length === 1) return <>{t('header.hand-size.player', { player })}</>
  return <>{t('header.hand-size.players')}</>
}
