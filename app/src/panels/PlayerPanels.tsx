import { css } from '@emotion/react'
import { Corporation, otherCorporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { CORRUPTION_WIN, PROPAGANDA_END, VIRUS_WIN } from '@gamepark/san/material/constants'
import { propagandaDirection } from '@gamepark/san/rules/helper/directions'
import { SanRules } from '@gamepark/san/SanRules'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import { createPortal } from 'react-dom'
import { corruptionIcon, propagandaIcon, virusIcon } from './resourceIcons'

export const PlayerPanels = () => {
  const players = usePlayers<Corporation>({ sortFromMe: true })
  const rules = useRules<SanRules>()!
  const root = document.getElementById('root')
  if (!root) {
    return null
  }

  // The per-turn resource counters used to show here (banked points to spend); they now sit above
  // the Discard pile instead (see PlayerResourceCounters). These are the 3 victory conditions'
  // progress instead: cards Corrupted, steps Propaganda has crossed, opponent's Virus cards Hacked
  // off — each out of the total needed to win that way (rules p.22).
  return createPortal(
    <>
      {players.map((player) => {
        const corruption = rules.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player.id).length
        const direction = propagandaDirection(rules.game, player.id)
        const bannerX = rules.material(MaterialType.Banner).id(player.id).getItem()?.location.x ?? 0
        const propaganda = direction === 1 ? bannerX : PROPAGANDA_END - bannerX
        const hacking = VIRUS_WIN - rules.material(MaterialType.Card).location(LocationType.VirusPile).player(otherCorporation(player.id)).length
        // White artwork (resourceIcons.ts) on the counter badge's own dark background (Counters' default
        // styling) — no inversion needed here, unlike PlayerResourceCounters' lighter Star badge.
        const counters = [
          { image: corruptionIcon, value: `${corruption}/${CORRUPTION_WIN}` },
          { image: propagandaIcon, value: `${propaganda}/${PROPAGANDA_END}` },
          { image: virusIcon, value: `${hacking}/${VIRUS_WIN}` }
        ]
        return (
          <StyledPlayerPanel
            key={player.id}
            player={player}
            css={[panelPosition(player.id), panelColor(player.id)]}
            activeRing
            counters={counters}
            countersPerLine={3}
          />
        )
      })}
    </>,
    root
  )
}

/**
 * Star's panel top-left, Moon's top-right — matching each Corporation's home corner on the table.
 * `top: 8em` clears the header bar (buttons/title fixed at the very top). The zoom buttons
 * ({@link GameTableNavigation}, in `GameDisplay.tsx`) are pushed right of the Star panel instead of
 * the other way around.
 */
const panelPosition = (corporation: Corporation) => css`
  position: absolute;
  top: 8em;
  ${corporation === Corporation.Star ? 'left' : 'right'}: 1em;
  width: 28em;
`

/**
 * Background colour matching each Corporation's Banner standee: Star's is light plastic, Moon's is
 * dark. `!important` guards against the panel's own default white background, whose stylesheet rule
 * may otherwise be inserted after this one and win the equal-specificity tie.
 */
const panelColor = (corporation: Corporation) =>
  corporation === Corporation.Star
    ? css`
        background-color: #f0f0ee !important;
      `
    : css`
        background-color: #1c1c1e !important;
        color: white !important;
      `
