/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { CardEffect, EffectType } from '@gamepark/san/material/CardsData'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { Memory } from '@gamepark/san/rules/Memory'
import { ItemContext, ItemMenuButton } from '@gamepark/react-game'
import { isCustomMoveType, MaterialMove } from '@gamepark/rules-api'
import { corruptionIcon, drawIcon, propagandaIcon, virusIcon } from '../panels/resourceIcons'
import { colors } from '../theme/colors'

interface PendingEitherChoice {
  itemIndex: number
  options: CardEffect[]
}

/** Icon shown on an option's button — the same artwork as the matching row of {@link import('./PlayerResourceCounters').PlayerResourceCounters}. */
const OPTION_ICON: Partial<Record<EffectType, { image: string; whiteArtwork: boolean }>> = {
  [EffectType.Corruption]: { image: corruptionIcon, whiteArtwork: true },
  [EffectType.Propaganda]: { image: propagandaIcon, whiteArtwork: true },
  [EffectType.Virus]: { image: virusIcon, whiteArtwork: true },
  [EffectType.Draw]: { image: drawIcon, whiteArtwork: true }
}

/**
 * One small icon button per option of this played card's still-unresolved "either / or" effect (see
 * {@link import('@gamepark/san/rules/Memory').Memory.PendingEitherChoices}), laid out in a row over
 * the top of the card, right where its printed effect icons sit — icon + value only, no text label,
 * so it reads at a glance instead of dwarfing the card.
 *
 * A plain function, called from {@link import('./SanCardDescription').SanCardDescription.getItemMenu}
 * rather than rendered through `content`: `content` nests it inside the card's own clickable area, so
 * a click on the button also bubbled up and opened the help dialog alongside playing the move.
 * `getItemMenu`'s buttons are mounted as a sibling of the card instead (the react-game library's own
 * `ItemMenuWrapper`), outside that clickable area, avoiding the conflict entirely — same reason
 * "Acheter"/"Copier"/"Piocher" already live there instead of in `content`.
 */
export const eitherChoiceButtons = (context: ItemContext, legalMoves: MaterialMove[]) => {
  const pending = context.rules.remind<PendingEitherChoice[]>(Memory.PendingEitherChoices) ?? []
  const choice = pending.find((entry) => entry.itemIndex === context.index)
  if (!choice) return

  const cardMoves = legalMoves
    .filter(isCustomMoveType(CustomMoveType.ChooseEffectOption))
    .filter((move) => (move.data as { itemIndex: number }).itemIndex === context.index)
    .sort((a, b) => (a.data as { option: number }).option - (b.data as { option: number }).option)
  if (!cardMoves.length) return

  // Roughly where the card's own printed effect icons sit: a row near the top edge, starting a bit
  // in from the left. Unlike most of `getItemMenu`'s other buttons (x/y from the card's centre),
  // these are positioned from the card's top-left corner instead, at the card's own 1 unit ≈
  // width/6.3 scale.
  const gap = 1.2
  const start = -2

  return (
    <>
      {cardMoves.map((move, i) => {
        const option = (move.data as { option: number }).option
        const effect = choice.options[option]
        const icon = OPTION_ICON[effect.type]
        return (
          <ItemMenuButton key={option} move={move} x={start + i * gap} y={-3.5} css={optionButtonCss}>
            {icon && <span css={[iconCss, icon.whiteArtwork && invertIconCss]} style={{ backgroundImage: `url(${icon.image})` }} />}
            {(effect.value ?? 1) > 1 && <span css={valueBadgeCss}>{effect.value}</span>}
          </ItemMenuButton>
        )
      })}
    </>
  )
}

const optionButtonCss = css`
  position: absolute !important;
  width: 1.2em !important;
  height: 1.2em !important;
  min-width: 0 !important;
  border-radius: 0.7em !important;
  padding: 0 !important;
  background-color: ${colors.paperSoft} !important;
  border: 0.06em solid ${colors.equipmentDark} !important;
  box-shadow: 0 0.1em 0.2em rgba(0, 0, 0, 0.4);
`

const iconCss = css`
  width: 0.8em;
  height: 0.8em;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
`

/** The counter icons' white artwork needs inverting to read dark against this button's light background. */
const invertIconCss = css`
  filter: invert(1);
`

const valueBadgeCss = css`
  position: absolute;
  top: -0.25em;
  right: -0.25em;
  min-width: 0.9em;
  height: 0.9em;
  padding: 0 0.1em;
  border-radius: 0.45em;
  background: ${colors.corruptionLight};
  color: ${colors.ink};
  font-size: 0.55em;
  font-weight: 700;
  line-height: 0.9em;
  text-align: center;
`
