import { isDeleteItemType, isMoveItemsAtOnce, isShuffle } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { SanCard } from '../material/SanCard'
import { EMPTY_RESOURCES, EMPTY_TURN_FLAGS, Memory } from './Memory'
import { RuleId } from './RuleId'
import { testRules } from '../tests/fixture'

const filler = (n: number, location: { type: LocationType; player?: Corporation }) =>
  Array.from({ length: n }, () => ({ id: SanCard.RiverEquipment1, location }))

describe('EndTurnRule', () => {
  test('boxes the Single Use cards and discards the rest of the play area, then loops back', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.MoonPropaganda, location: { type: LocationType.PlayArea, player: Corporation.Moon } }, // index 0, discarded
          { id: SanCard.RiverEquipment10, location: { type: LocationType.PlayArea, player: Corporation.Moon } } // index 1, boxed
        ]
      },
      { [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, singleUseCards: [1] } }
    )
    const consequences = rules.play(rules.startRule(RuleId.EndTurn))
    expect(consequences).toHaveLength(3)
    expect(consequences.some(isDeleteItemType(MaterialType.Card))).toBe(true)
    expect(consequences.some(isMoveItemsAtOnce)).toBe(true)
    expect(consequences).toContainEqual(rules.startRule(RuleId.EndTurn))

    for (const move of consequences) rules.play(move)
    expect(rules.material(MaterialType.Card).location(LocationType.PlayArea).player(Corporation.Moon).length).toBe(0)
    expect(rules.material(MaterialType.Card).location(LocationType.Discard).player(Corporation.Moon).length).toBe(1)
    expect(rules.material(MaterialType.Card).length).toBe(1) // the boxed card is gone entirely
  })

  test('refills the hand from the deck up to hand size, then loops back', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          ...filler(4, { type: LocationType.Hand, player: Corporation.Moon }),
          ...filler(5, { type: LocationType.Deck, player: Corporation.Moon })
        ]
      }
    )
    const consequences = rules.play(rules.startRule(RuleId.EndTurn)) // hand=4, target=6, deficit=2, deck has plenty
    expect(consequences).toHaveLength(2)
    expect(consequences).toContainEqual(rules.startRule(RuleId.EndTurn))

    rules.play(consequences[0])
    expect(rules.material(MaterialType.Card).location(LocationType.Hand).player(Corporation.Moon).length).toBe(6)
    expect(rules.material(MaterialType.Card).location(LocationType.Deck).player(Corporation.Moon).length).toBe(3)
  })

  test('reshuffles the discard into the deck once it runs dry while still short a card, then loops back', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          ...filler(5, { type: LocationType.Hand, player: Corporation.Moon }),
          ...filler(3, { type: LocationType.Discard, player: Corporation.Moon })
        ]
      }
    )
    const consequences = rules.play(rules.startRule(RuleId.EndTurn))
    expect(consequences).toHaveLength(3)
    expect(isMoveItemsAtOnce(consequences[0])).toBe(true)
    expect(isShuffle(consequences[1])).toBe(true)
    expect(consequences[2]).toEqual(rules.startRule(RuleId.EndTurn))
  })

  test('gives up and moves on when both the deck and the discard are empty', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      { [MaterialType.Card]: filler(3, { type: LocationType.Hand, player: Corporation.Moon }) }
    )
    const consequences = rules.play(rules.startRule(RuleId.EndTurn))
    expect(consequences).toEqual([rules.startPlayerTurn(RuleId.PlayCards, Corporation.Star)])
  })

  test('moves straight to the next turn when the play area is empty and the hand is already full', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      { [MaterialType.Card]: filler(6, { type: LocationType.Hand, player: Corporation.Moon }) }
    )
    const consequences = rules.play(rules.startRule(RuleId.EndTurn))
    expect(consequences).toEqual([rules.startPlayerTurn(RuleId.PlayCards, Corporation.Star)])
  })

  test('the next turn clears the unspent resources of the player who just played', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      { [MaterialType.Card]: filler(6, { type: LocationType.Hand, player: Corporation.Moon }) },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 2, coins: 3 } } }
    )
    rules.play(rules.startRule(RuleId.EndTurn))
    expect(rules.remind(Memory.Resources, Corporation.Moon)).toEqual(EMPTY_RESOURCES)
  })
})
