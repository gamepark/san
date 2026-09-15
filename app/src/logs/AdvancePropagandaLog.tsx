import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

export const AdvancePropagandaLog = ({ move }: MoveComponentProps) => {
  const name = usePlayerName(move.location.player)
  return <Trans i18nKey="history.propaganda.advance" values={{ player: name }} />
}
