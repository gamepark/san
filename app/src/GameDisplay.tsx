import { css } from '@emotion/react'
import { DevToolsHub, GameTable, GameTableNavigation } from '@gamepark/react-game'
import { PlayerPanels } from './panels/PlayerPanels'

export function GameDisplay() {
  const margin = { top: 7, left: 0, right: 0, bottom: 0 }
  return (
    <>
      <GameTable xMin={-65} xMax={65} yMin={-38} yMax={20} margin={margin} css={process.env.NODE_ENV === 'development' && tableBorder}>
        <GameTableNavigation css={navigationPosition} />
        <PlayerPanels />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
    </>
  )
}

const tableBorder = css`
  border: 1px solid white;
`

// Pushed past the Star player panel (left: 1em, width: 28em, in PlayerPanels.tsx), which sits at the
// same top-left corner as GameTableNavigation's own default position.
const navigationPosition = css`
  left: 30em !important;
`
