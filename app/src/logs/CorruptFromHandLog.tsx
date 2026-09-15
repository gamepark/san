import { SanCard } from '@gamepark/san/material/SanCard'
import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import { sanCardDescription } from '../material/SanCardDescription'
import { MaterialChip } from './MaterialChip'
import { useRevealedCard } from './useRevealedCard'

/** The "Corrupt a card from your hand" effect (free, no 3-point cost): the card comes from a Hand. */
export const CorruptFromHandLog = (props: MoveComponentProps) => {
  const { move, context } = props
  const name = usePlayerName(context.action.playerId)
  const card = useRevealedCard(props, move.itemIndex)

  return (
    <Trans
      i18nKey="history.corrupt.hand"
      values={{ player: name }}
      components={{ card: <MaterialChip item={card} image={sanCardDescription.images[card.id as SanCard]} /> }}
    />
  )
}
