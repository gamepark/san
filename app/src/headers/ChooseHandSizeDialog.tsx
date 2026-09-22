import { css, useTheme } from '@emotion/react'
import { ChooseHandSizeData, CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { Dialog, PlayMoveButton, useLegalMoves } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

/**
 * "Free" hand size option: the rulebook's "Mise à niveau" paragraph with one button per hand size.
 * It stays open, with no way to dismiss it, as long as the player still has to choose.
 */
export const ChooseHandSizeDialog = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const moves = useLegalMoves<CustomMove>(isCustomMoveType(CustomMoveType.ChooseHandSize))

  return (
    <Dialog open={moves.length > 0} css={dialogCss}>
      <div css={[contentCss, theme.dialog.content]}>
        <h2>{t('hand-size.title')}</h2>
        <p>{t('hand-size.rule')}</p>
        <div css={buttonsCss}>
          {moves.map((move) => {
            const { size } = move.data as ChooseHandSizeData
            return (
              <PlayMoveButton key={size} move={move}>
                {t('hand-size.play', { size })}
              </PlayMoveButton>
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}

/** Page, colours and faces come from theme.dialog (the rulebook look): only the layout is set here. */
const dialogCss = css`
  display: flex;
  max-width: 90vw;
  max-height: 90vh;
  padding: 2.5em 3em;
`

const contentCss = css`
  display: flex;
  flex-direction: column;
  max-width: 40em;
  font-size: calc(3em * var(--gp-scale));
`

const buttonsCss = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
`
