import { css } from '@emotion/react'
import { Corporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { crossingCost } from '@gamepark/san/rules/helper/crossingCost'
import { SanRules } from '@gamepark/san/SanRules'
import { FocusContext, useAnimation, useDraggedItem, usePlayerId, useRules } from '@gamepark/react-game'
import { isMoveItemType, Location, MaterialMove } from '@gamepark/rules-api'
import { useContext } from 'react'
import { CardArea } from '../locators/CardAreaLocator'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme/typography'
import { tutorial } from '../tutorial/Tutorial'

/**
 * Propaganda cost for the viewer (or, for a spectator, the Corporation displayed at the bottom) to
 * cross this River card: a small white triangle pointing right, the way the viewer's banner moves along
 * the track, in the bottom-left corner of the card, under the triangle printed on the card's edge. The opponent's cost is not shown. Same pattern as
 * dragon-bomb's DragonCardPowerBadge.
 *
 * Stays visible at all times, including while the card is merely draggable (a `translateZ` push, not
 * just `z-index`, keeps it above any glow/highlight the table renders around draggable cards in this
 * 3D-transformed hierarchy) — except while this exact card is the one actively being dragged, since
 * the badge (part of the card's own content) would otherwise drag along with it. That one exception is
 * a CSS opacity fade, not an unmount: dropping ends the drag a beat before the move settles into
 * `rules`, and unmounting there made the badge pop back in for that instant, then vanish again once
 * the card actually left the River — a visible blink. Fading keeps that instant imperceptible.
 * It fades the same way while the card is animated out of the River (corrupted, bought…): `rules`
 * only records the move once the animation ends, so the badge would otherwise travel with the card.
 *
 * The `translateZ` also lifts it above the library's play-down veil (a `z-index: 1` pseudo-element on
 * the card face), so a played-down card darkens the badge itself, like the veil does the card. Likewise
 * over the mask the library lays on a card whose areas the tutorial highlights: the badge darkens unless
 * the highlighted area is the crossing cost, which it belongs to.
 */
export const CrossingCostBadge = ({ itemIndex, playDown }: { itemIndex?: number; playDown?: boolean }) => {
  const rules = useRules<SanRules>()
  const draggedItem = useDraggedItem<MaterialType>()
  const playerId = usePlayerId<Corporation>()
  const focus = useContext(FocusContext)?.focus
  const leaving = useAnimation<MaterialMove>(
    ({ move }) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === itemIndex && move.location.type !== LocationType.River
  )
  if (!rules || itemIndex === undefined) return null
  // The tutorial first explains the printed cost, before the reduction the badge already includes
  if (rules.game.tutorial?.step === tutorial.crossingCostStep) return null
  const item = rules.material(MaterialType.Card).getItem(itemIndex)
  if (!item || item.location.type !== LocationType.River) return null
  const isDragged = draggedItem?.type === MaterialType.Card && draggedItem.index === itemIndex
  return (
    <span css={[badgeCss, (playDown || isMaskedByFocus(focus?.highlight ? focus.locations : [], itemIndex)) && playDownCss, (isDragged || leaving) && hiddenCss]}>
      <span css={triangleCss} />
      <span css={numberCss}>{crossingCost(rules, item.location.x ?? 0, playerId ?? rules.players[0])}</span>
    </span>
  )
}

/** Whether the tutorial highlights areas of this card, but not the crossing cost the badge sits in. */
const isMaskedByFocus = (locations: Location[], itemIndex: number) => {
  const areas = locations.filter((location) => location.type === LocationType.CardArea && location.parent === itemIndex)
  return areas.length > 0 && !areas.some((area) => area.id === CardArea.CrossingCost)
}

/** The shadow is on the wrapper: a `drop-shadow` filter follows the clipped triangle, a box-shadow would not. */
const badgeCss = css`
  position: absolute;
  left: 0.25em;
  bottom: 0.15em;
  width: 1.5em;
  height: 1.4em;
  transform: translateZ(3em);
  filter: drop-shadow(0 0.08em 0.15em rgba(0, 0, 0, 0.5));
  transition: opacity 0.15s ease;
  pointer-events: none;
`

/** Same darkening as the library's play-down veil (50 % black); the drop-shadow must be repeated, `filter` replaces it. */
const playDownCss = css`
  filter: brightness(0.5) drop-shadow(0 0.08em 0.15em rgba(0, 0, 0, 0.5));
`

const hiddenCss = css`
  opacity: 0;
`

const triangleCss = css`
  position: absolute;
  inset: 0;
  clip-path: polygon(0 0, 100% 50%, 0 100%);
  background: ${colors.paper};
`

/**
 * Over the triangle rather than inside it, so that the clip does not cut the digit: the triangle is
 * smaller than the digit is tall. It sits towards the wide side, where there is room for it.
 */
const numberCss = css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding-left: 0.2em;
  color: ${colors.propaganda};
  font-family: ${fontDisplay};
  font-size: 1em;
  font-weight: 700;
  line-height: 1;
`
