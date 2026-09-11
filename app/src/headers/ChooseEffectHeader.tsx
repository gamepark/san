/** @jsxImportSource @emotion/react */
import { PlayMoveButton, useLegalMoves, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { CardEffect } from '@gamepark/san/material/CardsData'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { Memory } from '@gamepark/san/rules/Memory'
import { SanRules } from '@gamepark/san/SanRules'
import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { effectLabel } from './effectLabel'

export const ChooseEffectHeader = () => {
  const me = usePlayerId()
  const rules = useRules<SanRules>()!
  const active = rules.game.rule?.player
  const player = usePlayerName(active)
  const { t } = useTranslation()
  const options = rules.remind<CardEffect[]>(Memory.PendingEffects)?.[0]?.option ?? []
  const moves = useLegalMoves<CustomMove>(isCustomMoveType(CustomMoveType.ChooseEffectOption))

  if (me === undefined || active !== me) {
    return <Trans i18nKey="header.choose-effect.player" values={{ player }} />
  }
  return (
    <>
      {t('header.choose-effect.you')}{' '}
      {moves.map((move) => (
        <PlayMoveButton key={move.data as number} move={move}>
          {effectLabel(options[move.data as number], t)}
        </PlayMoveButton>
      ))}
    </>
  )
}
