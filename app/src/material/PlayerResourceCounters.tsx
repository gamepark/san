import { css } from '@emotion/react'
import { Corporation } from '@gamepark/san/Corporation'
import { EMPTY_RESOURCES, Memory, ResourcesMemory } from '@gamepark/san/rules/Memory'
import { SanRules } from '@gamepark/san/SanRules'
import { useRules } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { coinIcon, corruptionIcon, propagandaIcon, virusIcon } from '../panels/resourceIcons'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme/typography'

/**
 * Corruption / Propaganda / Virus / Coin counters for a Corporation — moved here from the player
 * panels, above its Discard pile's own static location (declared on DiscardLocator, always present
 * even while the pile itself is empty). Small vertical stack, same colours as the crossing-cost
 * badges' Banner code: white on black for Moon, black on grey for Star.
 */
export const PlayerResourceCounters = ({ location }: { location: Location }) => {
  const rules = useRules<SanRules>()
  const player = location.player as Corporation | undefined
  if (!rules || player === undefined) return null

  // "Any resource" points count towards every resource at once.
  const resources = rules.remind<ResourcesMemory>(Memory.Resources, player) ?? EMPTY_RESOURCES
  const counters = [
    // corruption/propaganda/virus are the game's own white-artwork icons; coin is still the dark-stroke SVG.
    { image: corruptionIcon, value: resources.corruption + resources.flex, whiteArtwork: true },
    { image: propagandaIcon, value: resources.propaganda + resources.flex, whiteArtwork: true },
    { image: virusIcon, value: resources.virus + resources.flex, whiteArtwork: true },
    { image: coinIcon, value: resources.coins, whiteArtwork: false }
  ]
  const isMoon = player === Corporation.Moon
  const colorCss = isMoon ? moonCss : starCss
  return (
    <div css={wrapperCss}>
      {counters.map((counter, i) => {
        // White artwork needs inverting to read on Star's grey; the dark coin SVG needs it on Moon's black.
        const needsInvert = counter.whiteArtwork ? !isMoon : isMoon
        return (
          <span css={[counterCss, colorCss]} key={i}>
            <span css={[iconCss, needsInvert && invertIconCss]} style={{ backgroundImage: `url(${counter.image})` }} />
            {counter.value}
          </span>
        )
      })}
    </div>
  )
}

const wrapperCss = css`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -100%) translateY(-2em) translateZ(3em);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`

const counterCss = css`
  display: flex;
  align-items: center;
  gap: 0.2em;
  border-radius: 0.5em;
  border: 0.08em solid ${colors.corruptionLight};
  padding: 0.05em 0.3em;
  font-family: ${fontDisplay};
  font-size: 1.4em;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.3;
  white-space: nowrap;
  box-shadow: 0 0.15em 0.3em rgba(0, 0, 0, 0.35);
`

/** Moon: white on black, matching its Banner standee — same code as CrossingCostBadge's topCss. */
const moonCss = css`
  background: ${colors.moon};
  color: ${colors.paper};
`

/** Star: black on grey, matching its Banner standee — same code as CrossingCostBadge's bottomCss. */
const starCss = css`
  background: ${colors.starDark};
  color: ${colors.ink};
`

const iconCss = css`
  width: 0.9em;
  height: 0.9em;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
`

const invertIconCss = css`
  filter: invert(1);
`
