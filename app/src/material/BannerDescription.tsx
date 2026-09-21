import { css } from '@emotion/react'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Corporation } from '@gamepark/san/Corporation'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { ItemContext, TokenDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import moonBanner from '../images/pawns/MoonBanner.png'
import starBanner from '../images/pawns/StarBanner.png'
import { colors } from '../theme/colors'
import { IconMenuButton } from './IconMenuButton'

/** The standee banner each Corporation moves along the Propaganda track. Image id = {@link Corporation}. */
class BannerDescription extends TokenDescription<number, number, number, Corporation> {
  width = 2.7
  height = 4.1
  borderRadius = 0.3
  transparency = true

  images = {
    [Corporation.Moon]: moonBanner,
    [Corporation.Star]: starBanner
  }

  /**
   * A short click advances the banner one step instead of requiring a drag ({@link PlayCardsRule.propagandaMoves},
   * the only move ever offered for a Banner, so there is no target to disambiguate).
   */
  canShortClick(move: MaterialMove, context: ItemContext) {
    return (
      context.rules.game.rule?.id === RuleId.PlayCards &&
      isMoveItemType(MaterialType.Banner)(move) &&
      move.itemIndex === context.index
    )
  }

  menuAlwaysVisible = true

  /** "Avancer" button under the banner, for players who don't think of clicking or dragging the pawn itself. */
  getItemMenu(_item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    if (context.rules.game.rule?.id !== RuleId.PlayCards) return
    const advance = legalMoves.find((move) => isMoveItemType(MaterialType.Banner)(move) && move.itemIndex === context.index)
    if (!advance) return
    // Just below the banner (half-height 2.05).
    return (
      <IconMenuButton titleKey="button.advance-propaganda" labelAlwaysVisible css={advanceButtonCss} x={0} y={3} move={advance}>
        <FontAwesomeIcon icon={faArrowRight} />
      </IconMenuButton>
    )
  }

  /** No help dialog for the banner: it carries no printed text worth explaining, only its own move. */
  displayHelp(_item: MaterialItem, _context: ItemContext) {
    return undefined
  }
}

/** Propaganda blue, like the card buttons that spend a main resource. */
const advanceButtonCss = css`
  background-color: ${colors.propaganda} !important;
  border: 0.1em solid ${colors.corruptionLight} !important;
  color: ${colors.paper} !important;

  &:hover {
    background-color: ${colors.propagandaLight} !important;
  }
`

export const bannerDescription = new BannerDescription()
