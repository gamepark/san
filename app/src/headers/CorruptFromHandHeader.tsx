import { HeaderText } from '@gamepark/react-game'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { isCustomMoveType } from '@gamepark/rules-api'

export const CorruptFromHandHeader = () => (
  <HeaderText code="corrupt-hand" moves={{ pass: isCustomMoveType(CustomMoveType.Pass) }} />
)
