import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { and, isFromLocation, isMaterial, isMyMove, isToLocation, MaterialContext, MaterialGameAnimations } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isShuffle, MoveKind } from '@gamepark/rules-api'
import { virusTrackLocator } from '../locators/VirusTrackLocator'

export const gameAnimations = new MaterialGameAnimations()

// Playing one of my own hand cards: the move is already expected, so keep it snappy.
gameAnimations.configure(and(isMaterial(MaterialType.Card), isFromLocation(LocationType.Hand), isMyMove())).duration(200)

// The Draw effect ("Piocher" button): twice as fast as the defaults (1s per move, 1.5s per shuffle), the
// reshuffle of the discard included. The end-of-turn draw is another action, so it keeps the defaults.
const isDrawEffect = (context: MaterialContext) => isCustomMoveType(CustomMoveType.Draw)(context.action.move)
gameAnimations.configure((move, context) => move.kind === MoveKind.ItemMove && isDrawEffect(context)).duration(300)

// A corrupted card slides under the hand, which lies over the Corruption slots (HAND_Z = 5): keep its arc below it.
gameAnimations.configure(and(isMaterial(MaterialType.Card), isToLocation(LocationType.CorruptionZone))).arc(3)

/** Spaces the Virus pawn crosses between `from` and `to`, both excluded. */
const virusPath = (from: number, to: number): number[] => {
  const step = Math.sign(to - from)
  return Array.from({ length: Math.max(0, Math.abs(to - from) - 1) }, (_, i) => from + step * (i + 1))
}

const virusPawnFrom = (context: MaterialContext) => context.rules.material(MaterialType.VirusPawn).getItem()?.location.x ?? 0

const hop = (at: number, count: number) => ({ at: (at + 0.5) / count, elevation: 1 })

/**
 * Driving the opponent's top Virus card off is played as single-space hops (see
 * {@link PlayCardsRule.driveOffVirusHops}): each hop is quick, so the whole run reads as one move.
 */
gameAnimations
  .configure((move, context) => isMoveItemType(MaterialType.VirusPawn)(move) && isCustomMoveType(CustomMoveType.DriveOffVirus)(context.action.move))
  .duration(350)
  .trajectory(() => ({ waypoints: [hop(0, 1)] }))

// The Virus pawn hops from space to space along the path printed on the Virus cards, instead of sliding
// straight to its target — one hop per space, so a longer move lasts longer.
for (let hops = 1; hops <= 15; hops++) {
  gameAnimations
    .configure(
      (move, context) => isMoveItemType(MaterialType.VirusPawn)(move) && virusPath(virusPawnFrom(context), move.location.x ?? 0).length + 1 === hops
    )
    .duration(Math.max(600, 350 * hops))
    .trajectory((context, move) => {
      const path = isMoveItemType(MaterialType.VirusPawn)(move) ? virusPath(virusPawnFrom(context), move.location.x ?? 0) : []
      const count = path.length + 1
      return {
        waypoints: [
          ...path.map((x, i) => ({ at: (i + 1) / count, locator: virusTrackLocator, location: { type: LocationType.VirusTrack, x }, elevation: 0 })),
          ...Array.from({ length: count }, (_, i) => hop(i, count))
        ]
      }
    })
}
