import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanCard } from '@gamepark/san/material/SanCard'
import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { CustomMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { sanCardDescription } from '../material/SanCardDescription'
import { MaterialChip } from './MaterialChip'

/** `move.data` is the item index of the copied River card (see CustomMoveType.CopyRiverCard). */
export const CopyRiverCardLog = ({ move, context }: MoveComponentProps<CustomMove>) => {
  const name = usePlayerName(context.action.playerId)
  const card = context.game.items[MaterialType.Card][move.data as number]

  return (
    <Trans
      i18nKey="history.copy.river"
      values={{ player: name }}
      components={{ card: <MaterialChip item={card} image={sanCardDescription.images[card.id as SanCard]} /> }}
    />
  )
}
