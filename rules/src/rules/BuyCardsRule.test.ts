import { isCustomMoveType, isEndGame, isMoveItemType } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { SanCard } from '../material/SanCard'
import { CustomMoveType } from './CustomMoveType'
import { EMPTY_RESOURCES, Memory } from './Memory'
import { RuleId } from './RuleId'
import { testRules } from '../tests/fixture'

describe('BuyCardsRule', () => {
  test('skips straight to EndTurn when nothing in the River is affordable', () => {
    const rules = testRules(
      { id: RuleId.BuyCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverEquipment1, location: { type: LocationType.River, x: 0 } }] } // cost 3
    )
    const consequences = rules.play(rules.startRule(RuleId.BuyCards))
    expect(consequences).toEqual([rules.startRule(RuleId.EndTurn)])
  })

  test('offers only the River cards the current income can afford, plus ending the phase', () => {
    const rules = testRules(
      { id: RuleId.BuyCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverEquipment1, location: { type: LocationType.River, x: 0 } }, // cost 3
          { id: SanCard.RiverPropaganda3, location: { type: LocationType.River, x: 1 } } // cost 4
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, coins: 3 } } }
    )
    const moves = rules.getLegalMoves(Corporation.Moon)
    const buyMoves = moves.filter(isMoveItemType(MaterialType.Card))
    expect(buyMoves).toHaveLength(1)
    expect(buyMoves[0]).toMatchObject({ itemIndex: 0, location: { type: LocationType.Discard } })
    expect(moves.some(isCustomMoveType(CustomMoveType.EndBuyPhase))).toBe(true)
  })

  test('buying a card spends its cost and refills the River from the Reserve', () => {
    const rules = testRules(
      { id: RuleId.BuyCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverEquipment1, location: { type: LocationType.River, x: 0 } }, // cost 3
          { id: SanCard.RiverEquipment2, location: { type: LocationType.Reserve } }
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, coins: 5 } } }
    )
    const buy = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.Discard, player: Corporation.Moon })
    const consequences = rules.play(buy)

    expect(rules.remind(Memory.Resources, Corporation.Moon).coins).toBe(2)
    expect(consequences).toHaveLength(1)
    rules.play(consequences[0])
    expect(rules.material(MaterialType.Card).location(LocationType.River).length).toBe(1)
    expect(rules.material(MaterialType.Card).location(LocationType.Reserve).length).toBe(0)
  })

  test('buying the last River card while the Reserve is empty ends the game', () => {
    const rules = testRules(
      { id: RuleId.BuyCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverEquipment1, location: { type: LocationType.River, x: 0 } }] },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, coins: 5 } } }
    )
    const buy = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.Discard, player: Corporation.Moon })
    const consequences = rules.play(buy)
    expect(consequences).toHaveLength(1)
    expect(isEndGame(consequences[0])).toBe(true)
  })

  test('ending the buy phase moves to EndTurn', () => {
    const rules = testRules({ id: RuleId.BuyCards, player: Corporation.Moon }, {})
    const consequences = rules.play(rules.customMove(CustomMoveType.EndBuyPhase))
    expect(consequences).toEqual([rules.startRule(RuleId.EndTurn)])
  })
})
