import { css } from '@emotion/react'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { SanRules } from '@gamepark/san/SanRules'
import { MaterialHelpProps, PlayMoveButton, useLegalMove, useLegalMoves, useRules } from '@gamepark/react-game'
import { isCustomMoveType, isDeleteItemType, isMoveItemType } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * One button per action currently playable on this exact card, mirroring
 * {@link import('../../SanCardDescription').SanCardDescription.canShortClick} and
 * {@link import('../../SanCardDescription').SanCardDescription.getItemMenu} so the same actions
 * (play, buy, corrupt, destroy, copy) reachable by clicking/dragging the card on the table are also
 * reachable from its help dialog — same convention as boreal's BorealCardButton. Every one of these
 * is only offered here for as long as it's actually legal (a banked charge > 0, a pending "either /
 * or" choice, etc.) — see {@link import('@gamepark/san/rules/PlayCardsRule').PlayCardsRule}.
 */
export const SanCardButtons: FC<MaterialHelpProps> = (props) => {
  return (
    <>
      <PlayCardButton {...props} />
      <BuyCardButton {...props} />
      <CorruptCardButton {...props} />
      <DestroyCardButton {...props} />
      <CopyRiverButton {...props} />
    </>
  )
}

/** Covers playing a hand card and playing a discard card alike — both land on PlayArea. */
const PlayCardButton: FC<MaterialHelpProps> = ({ closeDialog, itemIndex }) => {
  const { t } = useTranslation()
  const move = useLegalMove(
    (move) =>
      isMoveItemType(MaterialType.Card)(move) &&
      move.itemIndex === itemIndex &&
      (move.location.type === LocationType.PlayArea || move.location.type === LocationType.Discard)
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

/** Only for River cards, while a banked CopyRiver charge remains and this one is still eligible. */
const CopyRiverButton: FC<MaterialHelpProps> = ({ closeDialog, itemIndex }) => {
  const { t } = useTranslation()
  const move = useLegalMove((move) => isCustomMoveType(CustomMoveType.CopyRiverCard)(move) && move.data === itemIndex)

  if (!move) return null

  return (
    <PlayMoveButton move={move} onPlay={closeDialog} css={marginCss}>
      {t('help.button.copy-river')}
    </PlayMoveButton>
  )
}

const marginCss = css`
  margin-top: 0.5em;
`
