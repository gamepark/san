import { DeckLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { playerSide, VIRUS_PILE_Y, VIRUS_TRACK_X } from './SanLayout'

/**
 * A Corporation's pile of its 5 Virus cards (location.x = 0 at the base, Virus 1, … 4 on top, Virus 5),
 * on its side of the Central Port, the base card sitting in the tile's notch. As on the rulebook
 * diagram (p.7), each card turns its bottom edge — where the first advancement space is — towards the
 * Central Port: the far pile is upright, the near one upside down.
 */
class VirusPileLocator extends DeckLocator {
  getCoordinates(location: Location, context: MaterialContext) {
    return { x: VIRUS_TRACK_X, y: VIRUS_PILE_Y * playerSide(location.player!, context) }
  }

  getRotateZ(location: Location, context: MaterialContext): number {
    return virusPileRotation(location, context)
  }
}

export const virusPileRotation = (location: Location, context: MaterialContext): number => (playerSide(location.player!, context) === 1 ? 180 : 0)

export const virusPileLocator = new VirusPileLocator()
