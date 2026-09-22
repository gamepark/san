import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { ChooseHandSizeData } from '@gamepark/san/rules/CustomMoveType'
import { Trans } from 'react-i18next'

/** "Free" hand size option: the hand size a player picked for the whole game. */
export const ChooseHandSizeLog = ({ move }: MoveComponentProps) => {
  const { player, size } = move.data as ChooseHandSizeData
  const name = usePlayerName(player)
  return <Trans i18nKey="history.hand-size" values={{ player: name, size }} />
}
