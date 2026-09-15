import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanCard } from '@gamepark/san/material/SanCard'
import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import { sanCardDescription } from '../material/SanCardDescription'
import { MaterialChip } from './MaterialChip'

/** Corrupting a River card (3 banked Corruption points spent, rules p.14): the River is public. */
export const CorruptCardLog = ({ move, context }: MoveComponentProps) => {
  const name = usePlayerName(context.action.playerId)
  const card = context.game.items[MaterialType.Card][move.itemIndex]

  return (
    <Trans
      i18nKey="history.corrupt.river"
      values={{ player: name }}
      components={{ card: <MaterialChip item={card} image={sanCardDescription.images[card.id as SanCard]} /> }}
    />
  )
}
