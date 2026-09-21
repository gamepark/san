import { css } from '@emotion/react'
import { Corporation } from '@gamepark/san/Corporation'
import { EMPTY_RESOURCES, Memory, ResourcesMemory } from '@gamepark/san/rules/Memory'
import { SanRules } from '@gamepark/san/SanRules'
import { useRules } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import {
  coinIcon,
  copyPlayedIcon,
  copyRiverIcon,
  corruptFromHandIcon,
  corruptionIcon,
  destroyIcon,
  drawIcon,
  playFromDiscardIcon,
  propagandaIcon,
  virusIcon
} from '../panels/resourceIcons'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme/typography'

/**
 * Corruption / Propaganda / Virus / Coin / Draw / Destroy / CorruptFromHand / PlayFromDiscard /
 * CopyRiver / CopyPlayed counters for a Corporation — moved here from the player panels, next to its Discard
 * pile's own static location (declared on DiscardLocator, always present even while the pile itself
 * is empty). Every card effect banks into one of these the instant it's played (see {@link
 * import('@gamepark/san/rules/PlayCardsRule').PlayCardsRule.applyEffect}); none of them force an immediate
 * decision, so each one is only ever shown here while there's still something to spend — a row at 0
 * is hidden rather than printed. Same colours as the crossing-cost badges' Banner code: white on
 * black for Moon, black on grey for Star.
 */
export const PlayerResourceCounters = ({ location }: { location: Location }) => {
  const rules = useRules<SanRules>()
  const { t } = useTranslation()
  const player = location.player as Corporation | undefined
  // Only the player whose turn it is has resources to spend.
  if (!rules || player === undefined || rules.game.rule?.player !== player) return null

  const resources = rules.remind<ResourcesMemory>(Memory.Resources, player) ?? EMPTY_RESOURCES
  const counters = [
    // All white artwork except the coin, which is still a dark-stroke SVG.
    { image: corruptionIcon, value: resources.corruption, whiteArtwork: true, titleKey: 'resource.corruption' },
    { image: propagandaIcon, value: resources.propaganda, whiteArtwork: true, titleKey: 'resource.propaganda' },
    { image: virusIcon, value: resources.virus, whiteArtwork: true, titleKey: 'resource.virus' },
    { image: coinIcon, value: resources.coins, whiteArtwork: false, titleKey: 'resource.coins' },
    { image: drawIcon, value: resources.draw, whiteArtwork: true, titleKey: 'resource.draw' },
    { image: destroyIcon, value: resources.destroy, whiteArtwork: true, titleKey: 'resource.destroy' },
    { image: corruptFromHandIcon, value: resources.corruptFromHand, whiteArtwork: true, titleKey: 'resource.corrupt-from-hand' },
    { image: playFromDiscardIcon, value: resources.playFromDiscard, whiteArtwork: true, titleKey: 'resource.play-from-discard' },
    { image: copyRiverIcon, value: resources.copyRiver, whiteArtwork: true, titleKey: 'resource.copy-river' },
    { image: copyPlayedIcon, value: resources.copyPlayed ?? 0, whiteArtwork: true, titleKey: 'resource.copy-played' }
  ].filter((counter) => counter.value > 0)
  if (!counters.length) return null
  const isMoon = player === Corporation.Moon
  const colorCss = isMoon ? moonCss : starCss
  return (
    <div css={wrapperCss}>
      {counters.map((counter, i) => {
        // White artwork needs inverting to read on Star's grey; the dark SVGs need it on Moon's black.
        const needsInvert = counter.whiteArtwork ? !isMoon : isMoon
        return (
          <span css={[counterCss, colorCss]} key={i} title={t(counter.titleKey)}>
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
  left: 100%;
  top: 50%;
  transform: translate(0.4em, -50%) translateZ(3em);
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.4em;
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
