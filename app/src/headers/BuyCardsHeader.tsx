import { HeaderText } from '@gamepark/react-game'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { isCustomMoveType } from '@gamepark/rules-api'

export const BuyCardsHeader = () => (
  <HeaderText code="buy" moves={{ end: isCustomMoveType(CustomMoveType.EndBuyPhase) }} />
)
