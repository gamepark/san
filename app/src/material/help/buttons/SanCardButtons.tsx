import { css } from '@emotion/react'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { SanRules } from '@gamepark/san/SanRules'
import { MaterialHelpProps, PlayMoveButton, useLegalMove, useLegalMoves, useRules } from '@gamepark/react-game'
import { isDeleteItemType, isMoveItemType } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * One button per action currently playable on this exact card, mirroring
 * {@link import('../../SanCardDescription').SanCardDescription.canShortClick} and
 * {@link import('../../SanCardDescription').SanCardDescription.getItemMenu} so the same 4 actions
 * (play, buy, corrupt, destroy) reachable by clicking/dragging the card on the table are also
 * reachable from its help dialog — same convention as boreal's BorealCardButton.
 */
export const SanCardButtons: FC<MaterialHelpProps> = (props) => {
  return (
    <>
      <PlayCardButton {...props} />
      <BuyCardButton {...props} />
      <CorruptCardButton {...props} />
      <DestroyCardButton {...props} />
    </>
  )
}

const PlayCardButton: FC<MaterialHelpProps> = ({ closeDialog, itemIndex }) => {
  const { t } = useTranslation()
  const rules = useRules<SanRules>()!
  const ruleId = rules.game.rule?.id
  const move = useLegalMove(
    (move) =>
      isMoveItemType(MaterialType.Card)(move) &&
      move.itemIndex === itemIndex &&
      ((ruleId === RuleId.PlayCards && (move.location.type === LocationType.PlayArea || move.location.type === LocationType.Discard)) ||
        (ruleId === RuleId.PlayFromDiscard && move.location.type === LocationType.PlayArea))
  )

  if (!move) return null

  return (
    <PlayMoveButton move={move} onPlay={closeDialog} css={marginCss}>
      {t('help.button.play')}
    </PlayMoveButton>
  )
}

const BuyCardButton: FC<MaterialHelpProps> = ({ closeDialog, itemIndex }) => {
  const { t } = useTranslation()
  const rules = useRules<SanRules>()!
  const move = useLegalMove(
    (move) =>
      rules.game.rule?.id === RuleId.BuyCards &&
      isMoveItemType(MaterialType.Card)(move) &&
      move.itemIndex === itemIndex &&
      move.location.type === LocationType.Discard
  )

  if (!move) return null

  return (
    <PlayMoveButton move={move} onPlay={closeDialog} css={marginCss}>
      {t('help.button.buy')}
    </PlayMoveButton>
  )
}

/** Only shown when unambiguous: several free CorruptionZone slots give several legal moves for the same card. */
const CorruptCardButton: FC<MaterialHelpProps> = ({ closeDialog, itemIndex }) => {
  const { t } = useTranslation()
  const moves = useLegalMoves(
    (move) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === itemIndex && move.location.type === LocationType.CorruptionZone
  )

  if (moves.length !== 1) return null

  return (
    <PlayMoveButton move={moves[0]} onPlay={closeDialog} css={marginCss}>
      {t('help.button.corrupt')}
    </PlayMoveButton>
  )
}

const DestroyCardButton: FC<MaterialHelpProps> = ({ closeDialog, itemIndex }) => {
  const { t } = useTranslation()
  const move = useLegalMove((move) => isDeleteItemType(MaterialType.Card)(move) && move.itemIndex === itemIndex)

  if (!move) return null

  return (
    <PlayMoveButton move={move} onPlay={closeDialog} css={marginCss}>
      {t('help.button.destroy')}
    </PlayMoveButton>
  )
}

const marginCss = css`
  margin-top: 0.5em;
`
