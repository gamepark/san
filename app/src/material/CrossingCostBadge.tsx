import { css } from '@emotion/react'
import { Corporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { crossingCost } from '@gamepark/san/rules/helper/crossingCost'
import { SanRules } from '@gamepark/san/SanRules'
import { useDraggedItem, useRules } from '@gamepark/react-game'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme/typography'

/**
 * Propaganda cost to cross this River card, for each Corporation — Moon's above the card, Star's
 * below (see SanCardDescription). Same pattern as dragon-bomb's DragonCardPowerBadge.
 *
 * Stays visible at all times, including while the card is merely draggable (a `translateZ` push, not
 * just `z-index`, keeps it above any glow/highlight the table renders around draggable cards in this
 * 3D-transformed hierarchy) — except while this exact card is the one actively being dragged, since
 * the badge (part of the card's own content) would otherwise drag along with it. That one exception is
 * a CSS opacity fade, not an unmount: dropping ends the drag a beat before the move settles into
 * `rules`, and unmounting there made the badge pop back in for that instant, then vanish again once
 * the card actually left the River — a visible blink. Fading keeps that instant imperceptible.
 */
export const CrossingCostBadge = ({ itemIndex }: { itemIndex?: number }) => {
  const rules = useRules<SanRules>()
  const draggedItem = useDraggedItem<MaterialType>()
  if (!rules || itemIndex === undefined) return null
  const item = rules.material(MaterialType.Card).getItem(itemIndex)
  if (!item || item.location.type !== LocationType.River) return null
  const riverX = item.location.x ?? 0
  const isDragged = draggedItem?.type === MaterialType.Card && draggedItem.index === itemIndex
  return (
    <>
      <span css={[badgeCss, topCss, isDragged && draggedCss]}>{crossingCost(rules, riverX, Corporation.Moon)}</span>
      <span css={[badgeCss, bottomCss, isDragged && draggedCss]}>{crossingCost(rules, riverX, Corporation.Star)}</span>
    </>
  )
}

const badgeCss = css`
  position: absolute;
  left: 50%;
  padding: 0.05em 0.5em;
  border-radius: 1em;
  border: 0.08em solid ${colors.corruptionLight};
  font-family: ${fontDisplay};
  font-size: 1.3em;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.4;
  white-space: nowrap;
  box-shadow: 0 0.15em 0.3em rgba(0, 0, 0, 0.35);
  transition: opacity 0.15s ease;
`

const draggedCss = css`
  opacity: 0;
`

/** Moon's badge: white on black, matching its Banner standee. */
const topCss = css`
  top: 0;
  transform: translate(-50%, -100%) translateZ(3em);
  background: ${colors.moon};
  color: ${colors.paper};
`

/** Star's badge: black on grey, matching its Banner standee. */
const bottomCss = css`
  bottom: 0;
  transform: translate(-50%, 100%) translateZ(3em);
  background: ${colors.starDark};
  color: ${colors.ink};
`
