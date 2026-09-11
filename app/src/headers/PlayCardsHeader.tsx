import { HeaderText } from '@gamepark/react-game'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { isCustomMoveType } from '@gamepark/rules-api'

export const PlayCardsHeader = () => (
  <HeaderText code="play" moves={{ end: isCustomMoveType(CustomMoveType.EndPlayPhase) }} />
)
