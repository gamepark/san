/** @jsxImportSource @emotion/react */
import { PlayMoveButton, useLegalMove, useLegalMoves, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { getCardData } from '@gamepark/san/material/CardsData'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanCard } from '@gamepark/san/material/SanCard'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { SanRules } from '@gamepark/san/SanRules'
import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

export const CopyRiverHeader = () => {
  const me = usePlayerId()
  const rules = useRules<SanRules>()!
  const active = rules.game.rule?.player
  const player = usePlayerName(active)
  const { t } = useTranslation()
  const moves = useLegalMoves<CustomMove>(isCustomMoveType(CustomMoveType.CopyRiverCard))
  const pass = useLegalMove(isCustomMoveType(CustomMoveType.Pass))

  if (me === undefined || active !== me) {
    return <Trans i18nKey="header.copy-river.player" values={{ player }} />
  }
  return (
    <>
      {t('header.copy-river.you')}{' '}
      {moves.map((move) => {
        const card = rules.material(MaterialType.Card).getItem<SanCard>(move.data as number)
        const type = getCardData(card.id)?.type
        return (
          <PlayMoveButton key={move.data as number} move={move}>
            {type !== undefined ? t(`card.type.${type}`) : SanCard[card.id]}
          </PlayMoveButton>
        )
      })}{' '}
      {pass && <PlayMoveButton move={pass}>{t('pass')}</PlayMoveButton>}
    </>
  )
}
