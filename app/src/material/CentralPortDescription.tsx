import { TokenDescription } from '@gamepark/react-game'
import centralPort from '../images/tiles/CentralPort.png'

/** The single Central Port tile, at the middle of the Virus track (84x28 mm, image carries a baked shadow). */
class CentralPortDescription extends TokenDescription {
  width = 9.6
  height = 4
  borderRadius = 0.3
  transparency = true

  image = centralPort
}

export const centralPortDescription = new CentralPortDescription()
