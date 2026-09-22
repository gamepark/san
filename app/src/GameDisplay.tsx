import { pointerWithin } from '@dnd-kit/core'
import { css } from '@emotion/react'
import { DevToolsHub, GameTable } from '@gamepark/react-game'
import { ChooseHandSizeDialog } from './headers/ChooseHandSizeDialog'
import { TABLE_HALF_HEIGHT, TABLE_X_MAX, TABLE_X_MIN } from './locators/SanLayout'
import { PlayerPanels } from './panels/PlayerPanels'

export function GameDisplay() {
  const margin = { top: 7, left: 0, right: 0, bottom: 0 }
  return (
    <>
      <GameTable xMin={TABLE_X_MIN} xMax={TABLE_X_MAX} yMin={-TABLE_HALF_HEIGHT} yMax={TABLE_HALF_HEIGHT}
                 collisionAlgorithm={pointerWithin}
                 margin={margin} css={process.env.NODE_ENV === 'development' && tableBorder}>
        <PlayerPanels />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
      <ChooseHandSizeDialog />
    </>
  )
}

const tableBorder = css`
  border: 1px solid white;
`
