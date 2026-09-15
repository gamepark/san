import { SanCard } from '@gamepark/san/material/SanCard'
import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import { sanCardDescription } from '../material/SanCardDescription'
import { MaterialChip } from './MaterialChip'
import { useRevealedCard } from './useRevealedCard'

export const PlayCardLog = (props: MoveComponentProps) => {
  const { move, context } = props
  const name = usePlayerName(context.action.playerId)
  const card = useRevealedCard(props, move.itemIndex)

  return (
    <Trans
      i18nKey="history.play.card"
      values={{ player: name }}
      components={{ card: <MaterialChip item={card} image={sanCardDescription.images[card.id as SanCard]} /> }}
    />
  )
}
