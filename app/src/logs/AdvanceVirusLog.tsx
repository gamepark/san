import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

/** The Virus track has no owner (it's shared, x = signed step from the Central Port): use the actor. */
export const AdvanceVirusLog = ({ context }: MoveComponentProps) => {
  const name = usePlayerName(context.action.playerId)
  return <Trans i18nKey="history.virus.advance" values={{ player: name }} />
}
