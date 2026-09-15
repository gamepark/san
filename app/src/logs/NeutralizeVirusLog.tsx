import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanCard } from '@gamepark/san/material/SanCard'
import { MoveComponentProps, usePlayerName } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import { sanCardDescription } from '../material/SanCardDescription'
import { MaterialChip } from './MaterialChip'

/**
 * Consequence of the Virus pawn crossing the Central Port from the opponent's side (rules p.19): their
 * top Virus card flips face down onto their own deck. The Virus pile is public, so no hiding to handle.
 */
export const NeutralizeVirusLog = ({ move, context }: MoveComponentProps) => {
  const name = usePlayerName(move.location.player)
  const card = context.game.items[MaterialType.Card][move.itemIndex]

  return (
    <Trans
      i18nKey="history.virus.neutralize"
      values={{ player: name }}
      components={{ card: <MaterialChip item={card} image={sanCardDescription.images[card.id as SanCard]} /> }}
    />
  )
}
