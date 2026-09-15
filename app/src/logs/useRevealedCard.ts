import { MaterialType } from '@gamepark/san/material/MaterialType'
import { MoveComponentProps, usePlayerId } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

/**
 * A card moved out of a Hand is hidden to everyone but its owner in the pre-move game state (see
 * SanRules.hidingStrategies), so the log line can't read its id off `context.game` for the opponent
 * or a spectator: fall back to the `reveal` data the framework attaches to the move itself.
 */
export const useRevealedCard = (props: MoveComponentProps, itemIndex: number): MaterialItem => {
  const { move, context } = props
  const player = usePlayerId()
  const itsMe = player !== undefined && context.action.playerId === player
  return itsMe ? context.game.items[MaterialType.Card][itemIndex] : { id: move.reveal?.id, location: { type: 0 } }
}
