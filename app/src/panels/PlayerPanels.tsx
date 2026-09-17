import { css } from '@emotion/react'
import { Corporation, otherCorporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { CORRUPTION_WIN, PROPAGANDA_END, VIRUS_WIN } from '@gamepark/san/material/constants'
import { propagandaDirection } from '@gamepark/san/rules/helper/directions'
import { SanRules } from '@gamepark/san/SanRules'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import {
  PLAYER_PANEL_EM_WIDTH,
  PLAYER_PANEL_WIDTH,
  PLAYER_PANEL_X,
  PLAYER_PANEL_Y,
  PLAYER_PANEL_Z,
  TABLE_HALF_HEIGHT,
  TABLE_X_MIN
} from '../locators/SanLayout'
import { corruptionIcon, propagandaIcon, virusIcon } from './resourceIcons'
import { colors } from '../theme/colors'

export const PlayerPanels = () => {
  const players = usePlayers<Corporation>({ sortFromMe: true })
  const rules = useRules<SanRules>()!

  // The per-turn resource counters used to show here (banked points to spend); they now sit above
  // the Discard pile instead (see PlayerResourceCounters). These are the 3 victory conditions'
  // progress instead: cards Corrupted, steps Propaganda has crossed, opponent's Virus cards Hacked
  // off — each out of the total needed to win that way (rules p.22).
  return (
    <>
      {players.map((player, index) => {
        const corruption = rules.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player.id).length
        const direction = propagandaDirection(rules.game, player.id)
        const bannerX = rules.material(MaterialType.Banner).id(player.id).getItem()?.location.x ?? 0
        const propaganda = direction === 1 ? bannerX : PROPAGANDA_END - bannerX
        const hacking = VIRUS_WIN - rules.material(MaterialType.Card).location(LocationType.VirusPile).player(otherCorporation(player.id)).length
        // White artwork (resourceIcons.ts) on the counter badge's own dark background (theme.playerPanel.dataBadge)
        // — no inversion needed here, unlike PlayerResourceCounters' lighter Star badge. Each counter's
        // border picks up its own resource colour instead of the generic corruption-gold every other
        // badge (name, timer) uses, so the 3 victory conditions read apart from one another.
        const counters = [
          { image: corruptionIcon, value: `${corruption}/${CORRUPTION_WIN}`, extraCss: counterBorder(colors.corruptionLight) },
          { image: propagandaIcon, value: `${propaganda}/${PROPAGANDA_END}`, extraCss: counterBorder(colors.propagandaLight) },
          { image: virusIcon, value: `${hacking}/${VIRUS_WIN}`, extraCss: counterBorder(colors.hackingLight) }
        ]
        return (
          <div key={player.id} css={panelPlace(index === 0)}>
            <StyledPlayerPanel player={player} css={[panelSize, panelColor(player.id)]} activeRing counters={counters} countersPerLine={3} />
          </div>
        )
      })}
    </>
  )
}

/**
 * Each panel is laid on the table, in the left corner of its owner's edge — mine at the bottom, my
 * opponent's at the top — so it pans and zooms with the material, as in Aurealis. Anchored by the edge
 * it lies against: the near panel by its bottom, hence the shift of its own height.
 */
const panelPlace = (near: boolean) => css`
  position: absolute;
  left: ${PLAYER_PANEL_X - TABLE_X_MIN}em;
  top: ${(near ? PLAYER_PANEL_Y : -PLAYER_PANEL_Y) + TABLE_HALF_HEIGHT}em;
  transform: translate3d(0, ${near ? -100 : 0}%, ${PLAYER_PANEL_Z}em);
  transform-style: preserve-3d;
`

/** The panel is sized in em: this font size turns its 28 em of width into {@link PLAYER_PANEL_WIDTH} cm of table. */
const panelSize = css`
  font-size: ${PLAYER_PANEL_WIDTH / PLAYER_PANEL_EM_WIDTH}em;
`

/**
 * Background colour matching each Corporation's Banner standee: Star's is light plastic, Moon's is
 * dark. `!important` guards against the panel's own default white background, whose stylesheet rule
 * may otherwise be inserted after this one and win the equal-specificity tie.
 */
const panelColor = (corporation: Corporation) =>
  corporation === Corporation.Star
    ? css`
        background-color: ${colors.starDark} !important;
      `
    : css`
        background-color: ${colors.moon} !important;
        color: ${colors.paper} !important;
      `

/** Overrides theme.playerPanel.dataBadge's generic gold border with this counter's own resource colour. */
const counterBorder = (color: string) => css`
  border-color: ${color} !important;
`
