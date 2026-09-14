import { css } from '@emotion/react'
import { Corporation } from '@gamepark/san/Corporation'
import { Memory } from '@gamepark/san/rules/Memory'
import { SanRules } from '@gamepark/san/SanRules'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import { createPortal } from 'react-dom'
import { coinIcon, corruptionIcon, propagandaIcon, virusIcon } from './resourceIcons'

export const PlayerPanels = () => {
  const players = usePlayers<Corporation>({ sortFromMe: true })
  const rules = useRules<SanRules>()!
  const root = document.getElementById('root')
  if (!root) {
    return null
  }

  return createPortal(
    <>
      {players.map((player) => {
        // "Any resource" points count towards every resource at once.
        const flex = rules.remind<number>(Memory.FlexPoints, player.id) ?? 0
        const counters = [
          { image: corruptionIcon, value: (rules.remind<number>(Memory.CorruptionPoints, player.id) ?? 0) + flex },
          { image: propagandaIcon, value: (rules.remind<number>(Memory.PropagandaPoints, player.id) ?? 0) + flex },
          { image: virusIcon, value: (rules.remind<number>(Memory.VirusPoints, player.id) ?? 0) + flex },
          { image: coinIcon, value: rules.remind<number>(Memory.Coins, player.id) ?? 0 }
        ]
        return (
          <StyledPlayerPanel
            key={player.id}
            player={player}
            css={[panelPosition(player.id), panelColor(player.id)]}
            activeRing
            counters={counters}
            countersPerLine={4}
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
