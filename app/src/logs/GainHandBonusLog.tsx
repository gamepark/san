import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { Trans } from 'react-i18next'

/** Consequence of the Banner landing on a Hand Bonus step (rules p.16). */
export const GainHandBonusLog = ({ move }: MoveComponentProps) => {
  const name = usePlayerName(move.location.player)
  return <Trans i18nKey="history.hand-bonus.gain" values={{ player: name }} />
}
