import { css } from '@emotion/react'
import { LocationDescription, MaterialContext, useMaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { CARD_BORDER_RADIUS, CARD_HEIGHT, CARD_WIDTH, playerSide } from '../locators/SanLayout'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme/typography'

/** Number of cards left in a Deck or in the Reserve. */
const countCards = (location: Location, context: MaterialContext) =>
  context.rules.material(MaterialType.Card).location(location.type).player(location.player).length

/** A Deck's count, in the middle of its top edge; the far Deck is turned 180°, so its badge is turned back upright. */
const DeckCounter = ({ location }: { location: Location }) => {
  const context = useMaterialContext()
  const upsideDown = playerSide(location.player!, context) === -1
  return <span css={[badgeCss, deckCss, upsideDown && upsideDownCss]}>{countCards(location, context)}</span>
}

/** The Reserve's count, right of the pile, level with its middle. */
const ReserveCounter = ({ location }: { location: Location }) => {
  const context = useMaterialContext()
  return <span css={[badgeCss, reserveCss]}>{countCards(location, context)}</span>
}

/** The footprint of a card, holding the count of the pile laid on it; the pile shows even while it is empty. */
class PileCounterDescription extends LocationDescription {
  width = CARD_WIDTH
  height = CARD_HEIGHT
  borderRadius = CARD_BORDER_RADIUS

  constructor(content: LocationDescription['content']) {
    super()
    this.content = content
  }
}

export const deckCounterDescription = new PileCounterDescription(DeckCounter)
export const reserveCounterDescription = new PileCounterDescription(ReserveCounter)

/** Above a whole pile (its cards are 0.05 cm apart), and never in the way of a click on its top card. */
const badgeCss = css`
  position: absolute;
  pointer-events: none;
  min-width: 1em;
  border-radius: 0.5em;
  padding: 0 0.3em;
  background: rgba(28, 28, 30, 0.6);
  color: ${colors.paper};
  font-family: ${fontDisplay};
  font-size: 0.9em;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
`

const deckCss = css`
  top: 0.2em;
  left: 50%;
  transform: translateX(-50%) translateZ(1em);
`

const upsideDownCss = css`
  transform: translateX(-50%) translateZ(1em) rotate(180deg);
`

const reserveCss = css`
  left: 100%;
  top: 50%;
  transform: translate(0.2em, -50%) translateZ(1em);
`
