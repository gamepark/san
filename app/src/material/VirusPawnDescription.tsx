import { ItemContext, TokenDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import virusPawn from '../images/pawns/VirusPawn.png'

/** The single Virus pawn moving along the Virus track. */
class VirusPawnDescription extends TokenDescription {
  width = 2.7
  height = 4.6
  borderRadius = 0.3
  transparency = true

  image = virusPawn

  /** No help dialog for the pawn: it carries no printed text worth explaining, only its own moves. */
  displayHelp(_item: MaterialItem, _context: ItemContext) {
    return undefined
  }
}

export const virusPawnDescription = new VirusPawnDescription()
