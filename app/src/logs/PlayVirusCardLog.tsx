import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

/** A Virus card played from hand has no effect, so no card is worth showing (rules, p.10). */
export const PlayVirusCardLog = ({ context }: MoveComponentProps) => {
  const name = usePlayerName(context.action.playerId)
  return <Trans i18nKey="history.play.virus" values={{ player: name }} />
}
