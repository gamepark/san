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
      {players.map((player, index) => {
        // "Any resource" points count towards every resource at once.
        const flex = rules.remind<number>(Memory.FlexPoints, player.id) ?? 0
        const counters = [
          { image: corruptionIcon, value: (rules.remind<number>(Memory.CorruptionPoints, player.id) ?? 0) + flex },
          { image: propagandaIcon, value: (rules.remind<number>(Memory.PropagandaPoints, player.id) ?? 0) + flex },
          { image: virusIcon, value: (rules.remind<number>(Memory.VirusPoints, player.id) ?? 0) + flex },
          { image: coinIcon, value: rules.remind<number>(Memory.Coins, player.id) ?? 0 }
        ]
        return <StyledPlayerPanel key={player.id} player={player} css={panelPosition(index)} activeRing counters={counters} countersPerLine={4} />
      })}
    </>,
    root
  )
}

const panelPosition = (index: number) => css`
  position: absolute;
  right: 1em;
  top: ${8.5 + index * 16}em;
  width: 28em;
`
