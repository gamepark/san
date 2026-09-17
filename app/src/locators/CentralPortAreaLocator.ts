import { Locator } from '@gamepark/react-game'
import { VIRUS_TRACK_X } from './SanLayout'

/** The Central Port tile, right of the River, between the two Virus piles (rules p.6-7). */
class CentralPortAreaLocator extends Locator {
  coordinates = { x: VIRUS_TRACK_X, y: 0 }
}

export const centralPortAreaLocator = new CentralPortAreaLocator()
