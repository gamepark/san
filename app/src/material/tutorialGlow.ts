import { css, keyframes } from '@emotion/react'
import { colors } from '../theme/colors'

const glowKeyframes = keyframes`
  from {
    filter: drop-shadow(0 0 0.15em ${colors.paper}) drop-shadow(0 0 0.3em ${colors.propagandaLight});
  }
  to {
    filter: drop-shadow(0 0 0.3em ${colors.paper}) drop-shadow(0 0 0.8em ${colors.propagandaLight});
  }
`

/**
 * Pulsing glow the tutorial puts on the Moon pieces it introduces: they are almost black, so on the darkened table
 * being the only focused items is not enough to spot them. A `drop-shadow` follows the outline of the cut-out image,
 * where the library's shine effect would sweep over its whole rectangle.
 */
export const tutorialGlowCss = css`
  animation: ${glowKeyframes} 1s ease-in-out infinite alternate;
`
