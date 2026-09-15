import { Material } from '@gamepark/rules-api'
import { Corporation } from '../../Corporation'
import { getCardData } from '../../material/CardsData'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { SanCard } from '../../material/SanCard'

/**
 * Just the `material()` query, common to a live {@link import('@gamepark/rules-api').MaterialRules}
 * instance (the app's `useRules`) and to `this` inside any rules-side `SanRule` — structural typing
 * lets {@link crossingCost} take either, without depending on their unrelated class hierarchies.
 */
type MaterialAccess = { material(type: MaterialType): Material<Corporation, MaterialType, LocationType> }

/**
 * Cost (in Propaganda points) to cross the River card at `riverX`, for `player`: the card's printed
 * cost, reduced by that player's own Corruption cards facing it and increased by the opponent's
 * (rules, p.14). Shared between {@link import('../PlayCardsRule').PlayCardsRule.propagandaMoves} /
 * {@link import('../PlayCardsRule').PlayCardsRule.afterItemMove} (which spend the banked points) and
 * the app's crossing-cost badges (`CrossingCostBadge.tsx`).
 */
export const crossingCost = (rules: MaterialAccess, riverX: number, player: Corporation): number => {
  const card = rules
    .material(MaterialType.Card)
    .location(LocationType.River)
    .getItems<SanCard>()
    .find((item) => item.location.x === riverX)
  const base = (card && getCardData(card.id)?.crossingCost) ?? 0
  const mine = rules
    .material(MaterialType.Card)
    .location(LocationType.CorruptionZone)
    .player(player)
    .filter((item) => item.location.x === riverX).length
  const opponent = rules
    .material(MaterialType.Card)
    .location(LocationType.CorruptionZone)
    .player((p) => p !== undefined && p !== player)
    .filter((item) => item.location.x === riverX).length
  return Math.max(0, base - mine + opponent)
}
