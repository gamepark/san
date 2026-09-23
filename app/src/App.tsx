import { css } from '@emotion/react'
import { FailuresDialog, FullscreenDialog, LiveLogContainer, LoadingScreen, MaterialGameSounds, MaterialHeader, MaterialImageLoader, Menu, useGame } from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { useEffect, useState } from 'react'
import { GameDisplay } from './GameDisplay'
import { GameOverRule } from './headers/GameOverRule'
import { Headers } from './headers/Headers'

export function App() {
  const game = useGame<MaterialGame>()
  const [isJustDisplayed, setJustDisplayed] = useState(true)
  const [isImagesLoading, setImagesLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setJustDisplayed(false), process.env.NODE_ENV === 'development' ? 0 : 2000)
  }, [])
  const loading = !game || isJustDisplayed || isImagesLoading
  return (
    <>
      {!!game && <GameDisplay />}
      <LoadingScreen display={loading} />
      <MaterialHeader rulesStepsHeaders={Headers} GameOverRule={GameOverRule} loading={loading} />
      {/* Gated on `game`, not just rendered unconditionally: useFlatHistory (inside LiveLogContainer)
          builds its replay engine from `state.setup` on first mount, and locks in an empty `{}` forever
          if that fires before `state.setup` is loaded (see GamePark/react-game#useFlatHistory). Mounting
          only once `game` is truthy — set in the same reducer case as `setup` — avoids that race. */}
      {!!game && (
        <div css={liveLogCss}>
          <LiveLogContainer maxItemDisplayed={4} />
        </div>
      )}
      <MaterialImageLoader onImagesLoad={() => setImagesLoading(false)} />
      <MaterialGameSounds />
      <Menu />
      <FailuresDialog />
      <FullscreenDialog />
    </>
  )
}

// Live log: top center, just below the header bar. Entries have no pointer-events of their own, and
// this wrapper adds none either, so it never blocks clicks on the board underneath.
const liveLogCss = css`
  position: absolute;
  top: 7.5em; // header is 7em tall
  left: 50%;
  transform: translateX(-50%);
  width: 26em;
  max-width: 85vw;
  font-size: calc(1em * var(--gp-scale));
  z-index: 20;
  pointer-events: none;
`
