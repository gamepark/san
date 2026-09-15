import { css } from '@emotion/react'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanRules } from '@gamepark/san/SanRules'
import { useRules } from '@gamepark/react-game'

/**
 * How many cards remain in the shared Reserve pile (used to refill the River). A static location
 * declared on `ReserveLocator.ts` — same technique as the Discard's resource counters — kept always
 * present so it still reads 0 once the Reserve empties (which ends the game, rules p.13/22).
 *
 * Placed below the pile rather than centred on it: `StaticLocationsDisplay` (this badge) paints
 * before `DynamicItemsDisplay` (the actual stacked cards) in the DOM, so the cards would cover it if
 * it sat on top of them regardless of `translateZ`.
 */
export const ReserveCountBadge = () => {
  const rules = useRules<SanRules>()
  if (!rules) return null
  const count = rules.material(MaterialType.Card).location(LocationType.Reserve).length
  return <span css={badgeCss}>{count}</span>
}

const badgeCss = css`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, 0.3em) translateZ(3em);
  font-size: 1.6em;
  font-weight: bold;
  color: white;
  text-shadow:
    0 0 0.15em black,
    0 0 0.15em black;
  pointer-events: none;
`
