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
// The framework's log container doubles this font size: 1.5em gives entries 3em, the size of the menus.
// Each entry holds on one line: the wrapper takes the width of the longest one, and the descendant
// selector outweighs the framework's `white-space: pre-wrap` on the entry.
const liveLogCss = css`
  position: absolute;
  top: 5em; // 7.5 root em at this 1.5em font size: header is 7em tall
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 95vw;
  font-size: calc(1.5em * var(--gp-scale));
  z-index: 20;
  pointer-events: none;

  div {
    white-space: nowrap;
  }

  // The entry (container > item > entry) only pads its left side: balance it now that its width fits the text
  > div > div > div {
    padding-right: 1em;
  }
`
