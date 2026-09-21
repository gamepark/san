import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { virusDirection } from '@gamepark/san/rules/helper/directions'
import { PlayCardsRule } from '@gamepark/san/rules/PlayCardsRule'
import { and, isFromLocation, isMaterial, isMyMove, MaterialContext, MaterialGameAnimations } from '@gamepark/react-game'
import { isMoveItemType, Location } from '@gamepark/rules-api'
import { virusTrackLocator } from '../locators/VirusTrackLocator'

export const gameAnimations = new MaterialGameAnimations()

// Playing one of my own hand cards: the move is already expected, so keep it snappy.
gameAnimations.configure(and(isMaterial(MaterialType.Card), isFromLocation(LocationType.Hand), isMyMove())).duration(200)

/**
 * Spaces the Virus pawn crosses between `from` and `to`, both excluded. Driving the opponent's top card
 * off crosses all of that card's spaces, then leaves it by its far end straight back to the Central Port.
 */
const virusPath = (context: MaterialContext, from: number, to: Partial<Location>): number[] => {
  const rule = new PlayCardsRule(context.rules.game)
  const end = rule.isVirusDriveOff(from, to)
    ? virusDirection(context.rules.game, rule.player) * (rule.virusChips(rule.virusOpponent) + 1) // one past their last space
    : (to.x ?? 0)
  const step = Math.sign(end - from)
  return Array.from({ length: Math.max(0, Math.abs(end - from) - 1) }, (_, i) => from + step * (i + 1))
}

const virusPawnFrom = (context: MaterialContext) => context.rules.material(MaterialType.VirusPawn).getItem()?.location.x ?? 0

// The Virus pawn hops from space to space along the path printed on the Virus cards, instead of sliding
// straight to its target — one hop per space, so a longer move lasts longer.
for (let hops = 1; hops <= 15; hops++) {
  gameAnimations
    .configure(
      (move, context) =>
        isMoveItemType(MaterialType.VirusPawn)(move) &&
        virusPath(context, virusPawnFrom(context), move.location).length + 1 === hops
    )
    .duration(Math.max(600, 350 * hops))
    .trajectory((context, move) => {
      const path = isMoveItemType(MaterialType.VirusPawn)(move) ? virusPath(context, virusPawnFrom(context), move.location) : []
      const count = path.length + 1
      return {
        waypoints: [
          ...path.map((x, i) => ({ at: (i + 1) / count, locator: virusTrackLocator, location: { type: LocationType.VirusTrack, x }, elevation: 0 })),
          ...Array.from({ length: count }, (_, i) => ({ at: (i + 0.5) / count, elevation: 1 }))
        ]
      }
    })
}
