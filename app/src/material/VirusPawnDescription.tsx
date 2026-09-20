/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ItemContext, ItemMenuButton, TokenDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { virusDirection } from '@gamepark/san/rules/helper/directions'
import { PlayCardsRule } from '@gamepark/san/rules/PlayCardsRule'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { Trans } from 'react-i18next'
import virusPawn from '../images/pawns/VirusPawn.png'

/** The single Virus pawn moving along the Virus track. */
class VirusPawnDescription extends TokenDescription {
  width = 2.7
  height = 4.6
  borderRadius = 0.3
  transparency = true

  image = virusPawn

  /** No help dialog for the pawn: it carries no printed text worth explaining, only its own moves. */
  displayHelp(_item: MaterialItem, _context: ItemContext) {
    return undefined
  }

  // Always visible, same as the card buttons, so it stays reachable on touch devices.
  menuAlwaysVisible = true

  /**
   * "Avancer de x": the pawn only ever goes one way (towards the opponent's Virus card), so a single
   * button moves it as far as the banked Skull points allow, up to the last space of that card
   * (counted from our own card too) — the farthest of {@link PlayCardsRule.virusMoves}. Nearer spaces
   * stay reachable through the track's own drop zones.
   */
  getItemMenu(item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    if (context.rules.game.rule?.id !== RuleId.PlayCards) return
    const rule = new PlayCardsRule(context.rules.game)
    const from = item.location.x ?? 0
    const dir = virusDirection(context.rules.game, rule.player) // +1: our own card is on the negative side
    let farthest: { move: MaterialMove; steps: number; target: number } | undefined
    for (const move of legalMoves) {
      if (!isMoveItemType(MaterialType.VirusPawn)(move) || move.location.type !== LocationType.VirusTrack) continue
      const target = move.location.x ?? 0
      const steps = rule.virusStepsCost(from, target)
      if (!farthest || steps > farthest.steps) farthest = { move, steps, target }
    }
    if (!farthest) return
    // Towards the opponent is "backward" on our own card's numbering: the pawn starts on it and stays on it (or reaches the Port).
    const backward = from * dir < 0 && farthest.target * dir <= 0
    return <AdvanceButton move={farthest.move} steps={farthest.steps} backward={backward} />
  }
}

/** Small arrow button (up the screen to advance on the opponent's card, down to go back on our own) with its "Avancer de x" / "Reculer de x" label beside it. */
const AdvanceButton = ({ move, steps, backward }: { move: MaterialMove; steps: number; backward: boolean }) => (
  <ItemMenuButton move={move} x={0} y={-4} css={advanceButtonCss} label={<Trans i18nKey={backward ? 'button.retreat-virus' : 'button.advance-virus'} values={{ steps }} />}>
    <FontAwesomeIcon icon={backward ? faArrowDown : faArrowUp} />
  </ItemMenuButton>
)

/** No `font-size` here: the button's `x`/`y` offsets are in `em`, so it would move it — the icon is shrunk instead. */
const advanceButtonCss = css`
  width: 1.3em !important;
  height: 1.3em !important;

  svg {
    font-size: 0.7em;
  }
`

export const virusPawnDescription = new VirusPawnDescription()
