import { css } from '@emotion/react'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { PlayMoveButton } from '@gamepark/react-game'
import { MaterialItem, MaterialMoveBuilder } from '@gamepark/rules-api'
import { colors } from '../theme/colors'

/**
 * Small clickable card image inline in a log line, opening the card's help dialog on click. Falls
 * back to a plain "?" chip when the card is still hidden to the viewer (see {@link useRevealedCard}).
 */
export const MaterialChip = ({ item, image }: { item: MaterialItem; image?: string }) => {
  if (!image) return <span css={[wrapperCss, hiddenCss]}>?</span>

  return (
    <PlayMoveButton move={MaterialMoveBuilder.displayMaterialHelp(MaterialType.Card, item)} transient css={[wrapperCss, buttonResetCss]}>
      <img src={image} alt="" css={imgCss} />
    </PlayMoveButton>
  )
}

const wrapperCss = css`
  display: inline-block;
  width: 1.6em;
  height: 2.2em;
  border-radius: 0.2em;
  margin: 0 0.15em;
  vertical-align: -0.6em;
  box-shadow: 0 0.05em 0.2em rgba(0, 0, 0, 0.5);
  overflow: hidden;
`

const buttonResetCss = css`
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:hover, &:focus, &:active {
    background: transparent !important;
    opacity: 1 !important;
    transform: scale(1.05);
  }
`

const imgCss = css`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`

const hiddenCss = css`
  background: ${colors.equipmentDark};
  color: ${colors.paper};
  display: inline-grid;
  place-items: center;
  font-weight: 700;
  opacity: 0.7;
`
