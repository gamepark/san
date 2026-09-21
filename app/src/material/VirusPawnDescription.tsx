/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { PropsWithChildren } from 'react'
import { ItemContext, TokenDescription, useAnimation, useRules } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, Location, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { SanRules } from '@gamepark/san/SanRules'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { PlayCardsRule } from '@gamepark/san/rules/PlayCardsRule'
import { RuleId } from '@gamepark/san/rules/RuleId'
import hacking from '../images/icons/hacking.png'
import virusPawn from '../images/pawns/VirusPawn.png'
import { PAWN_OFFSET, virusTrackLocator } from '../locators/VirusTrackLocator'
import { colors } from '../theme/colors'
import { IconMenuButton } from './IconMenuButton'

/** Distance (in cm) from a space's centre to its button's: half the yellow square (1.68 wide) + half the button (2 wide) + a small gap. */
const BUTTON_OFFSET = 0.84 + 1 + 0.1

/** Distance (in cm) from the Central Port's centre to its buttons': clear of the pawn standing there (2.7 wide). */
const PORT_BUTTON_OFFSET = 1.35 + 1 + 0.2

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
   * One "xN" button beside every space the pawn can reach ({@link PlayCardsRule.virusMoves}), N being the
   * Skull points it costs. The buttons belong to the pawn's menu, so each is placed by its space's offset
   * from the pawn; it sits on the outer side of the square (left or right half of the card), label outwards.
   * On the Central Port, the button is on the left when the pawn retreats there from the player's own card,
   * on the right when it drives the opponent's top card off ({@link CustomMoveType.DriveOffVirus}).
   */
  getItemMenu(item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    if (context.rules.game.rule?.id !== RuleId.PlayCards) return
    const rule = new PlayCardsRule(context.rules.game)
    const from = item.location.x ?? 0
    const pawn = virusTrackLocator.getCoordinates(item.location, context)
    const port = virusTrackLocator.getCoordinates({ type: LocationType.VirusTrack, x: 0 }, context)
    const moves = legalMoves.filter(isMoveItemType(MaterialType.VirusPawn)).filter((move) => move.location.type === LocationType.VirusTrack)
    const driveOff = legalMoves.find(isCustomMoveType(CustomMoveType.DriveOffVirus))
    if (!moves.length && !driveOff) return
    return (
      <HiddenWhileVirusCardLeaves>
        {moves.map((move) => {
          const location = move.location as Location
          const target = virusTrackLocator.getCoordinates(location, context)
          const to = location.x ?? 0
          const onPort = to === 0
          const side = onPort ? -1 : virusTrackLocator.getSide(to, context)
          return (
            <VirusButton
              key={to}
              move={move}
              steps={rule.virusStepsCost(from, location)}
              side={side}
              x={target.x - pawn.x - PAWN_OFFSET.x + side * (onPort ? PORT_BUTTON_OFFSET : BUTTON_OFFSET)}
              y={target.y - pawn.y - PAWN_OFFSET.y}
            />
          )
        })}
        {driveOff && (
          <VirusButton
            move={driveOff}
            steps={rule.driveOffVirusCost}
            side={1}
            x={port.x - pawn.x - PAWN_OFFSET.x + PORT_BUTTON_OFFSET}
            y={port.y - pawn.y - PAWN_OFFSET.y}
          />
        )}
      </HiddenWhileVirusCardLeaves>
    )
  }
}

type VirusButtonProps = { move: MaterialMove; steps: number; side: number; x: number; y: number }

const VirusButton = ({ move, steps, side, x, y }: VirusButtonProps) => (
  <IconMenuButton
    titleKey="button.move-virus"
    titleValues={{ steps }}
    labelAlwaysVisible
    labelPosition={side < 0 ? 'left' : 'right'}
    css={virusButtonCss}
    x={x}
    y={y}
    move={move}
  >
    <img src={hacking} alt="" css={iconCss} draggable={false} />
  </IconMenuButton>
)

/**
 * Driving the opponent's top Virus card off plays the pawn's hops, then sends the card onto their deck. The
 * legal moves already hold for the next card, but the spaces are still placed on the leaving one until its
 * animation ends: hide the buttons meanwhile, instead of flashing them beside the wrong card.
 */
const HiddenWhileVirusCardLeaves = ({ children }: PropsWithChildren) => {
  const rules = useRules<SanRules>()
  const leaving = useAnimation<MaterialMove>(
    ({ move }) =>
      isMoveItemType(MaterialType.Card)(move) &&
      rules?.material(MaterialType.Card).getItem(move.itemIndex)?.location.type === LocationType.VirusPile
  )
  return leaving ? null : <>{children}</>
}

/** Hacking red, like the Virus resource. */
const virusButtonCss = css`
  background-color: ${colors.hacking} !important;
  border: 0.1em solid ${colors.paperSoft} !important;

  &:hover {
    background-color: ${colors.hackingDark} !important;
  }
`

/**
 * The Hacking icon's white artwork reads as is on the red button. An `<img>`, not a `<span>`: the
 * button's label is styled through `> span` ({@link IconMenuButton}), whose `background` would override it.
 */
const iconCss = css`
  width: 1.1em;
  height: 1.1em;
  object-fit: contain;
  pointer-events: none;
`

export const virusPawnDescription = new VirusPawnDescription()
