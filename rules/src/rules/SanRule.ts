import { MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { Corporation } from '../Corporation'
import { RIVER_SIZE } from '../material/constants'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType, DrawData } from './CustomMoveType'
import { ResourcesHelper } from './helper/ResourcesHelper'
import { TurnFlagsHelper } from './helper/TurnFlagsHelper'

/**
 * What the rules of a player turn share: the piles they touch, refilling the River and drawing
 * cards. Resources and turn flags live in their own {@link ResourcesHelper} / {@link
 * TurnFlagsHelper} (see `./helper`).
 */
export abstract class SanRule extends PlayerTurnRule<Corporation, MaterialType, LocationType> {
  resourcesHelper = new ResourcesHelper(this.game, this.player)
  turnFlagsHelper = new TurnFlagsHelper(this.game)

  get hand() {
    return this.material(MaterialType.Card).location(LocationType.Hand).player(this.player)
  }

  get playArea() {
    return this.material(MaterialType.Card).location(LocationType.PlayArea).player(this.player)
  }

  get river() {
    return this.material(MaterialType.Card).location(LocationType.River)
  }

  get reserve() {
    return this.material(MaterialType.Card).location(LocationType.Reserve)
  }

  /** River card physically spanned by a banner step. The Propaganda track is numbered opposite to the
   * River (step 0 sits at the River's `x = 5` end), so a step and its River column are mirrored:
   * leaving step `s` towards step `s + 1` crosses River card `RIVER_SIZE - 1 - s`.
   */
  crossedRiverX(step: number, direction: 1 | -1): number {
    return direction === 1 ? RIVER_SIZE - 1 - step : RIVER_SIZE - step
  }

  /**
   * Refill an emptied River slot from the top of the Reserve, then turn the new top card face up
   * (`rotation: true`, the rest of the Reserve is shown face down). An empty Reserve ends the game (rules, p.22).
   */
  refillRiver(): MaterialMove[] {
    const deck = this.reserve.deck()
    if (!deck.length) return [this.endGame()]
    const moves: MaterialMove[] = [deck.dealOne({ type: LocationType.River })]
    if (deck.length) moves.push(deck.limit(1).rotateItem(true))
    return moves
  }

  /** Deal cards from a Corporation's deck to its hand — the reshuffle of the discard is handled by {@link import('../SanRules').SanRules}. */
  drawCards(player: Corporation, quantity: number): MaterialMove {
    return this.customMove(CustomMoveType.Draw, { player, quantity } satisfies DrawData)
  }
}
