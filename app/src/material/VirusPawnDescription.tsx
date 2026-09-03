import { TokenDescription } from '@gamepark/react-game'
import virusPawn from '../images/pawns/VirusPawn.png'

/** The single Virus pawn moving along the Virus track. */
class VirusPawnDescription extends TokenDescription {
  width = 2.7
  height = 4.1
  borderRadius = 0.3
  transparency = true

  image = virusPawn
}

export const virusPawnDescription = new VirusPawnDescription()
