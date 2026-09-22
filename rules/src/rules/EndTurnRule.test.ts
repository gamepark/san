import { isCustomMoveType, isDeleteItemType, isMoveItemsAtOnce, isShuffle } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { SanCard } from '../material/SanCard'
import { EMPTY_RESOURCES, EMPTY_TURN_FLAGS, Memory } from './Memory'
import { RuleId } from './RuleId'
import { playAll, testRules } from '../tests/fixture'
import { SanRules } from '../SanRules'
import { CustomMoveType } from './CustomMoveType'

const filler = (n: number, location: { type: LocationType; player?: Corporation }) =>
  Array.from({ length: n }, () => ({ id: SanCard.RiverEquipment1, location }))

describe('EndTurnRule', () => {
  test('boxes the Single Use cards and discards the rest of the play area before drawing', () => {
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
    expect(consequences).toHaveLength(4)
    expect(isDeleteItemType(MaterialType.Card)(consequences[0])).toBe(true)
    expect(isMoveItemsAtOnce(consequences[1])).toBe(true)
    expect(isCustomMoveType(CustomMoveType.Draw)(consequences[2])).toBe(true)
    expect(consequences[3]).toEqual(rules.startPlayerTurn(RuleId.PlayCards, Corporation.Star))

    for (const move of consequences) rules.play(move)
    expect(rules.material(MaterialType.Card).location(LocationType.PlayArea).player(Corporation.Moon).length).toBe(0)
    expect(rules.material(MaterialType.Card).location(LocationType.Discard).player(Corporation.Moon).length).toBe(1)
    expect(rules.material(MaterialType.Card).length).toBe(1) // the boxed card is gone entirely
  })

  const count = (rules: SanRules, type: LocationType) => rules.material(MaterialType.Card).location(type).player(Corporation.Moon).length

  test('refills the hand from the deck up to hand size, then passes to the opponent', () => {
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
    expect(consequences).toEqual([rules.customMove(CustomMoveType.Draw, { player: Corporation.Moon, quantity: 2 }), rules.startPlayerTurn(RuleId.PlayCards, Corporation.Star)])

    playAll(rules, consequences)
    expect(count(rules, LocationType.Hand)).toBe(6)
    expect(count(rules, LocationType.Deck)).toBe(3)
    expect(rules.game.rule?.player).toBe(Corporation.Star)
  })

  test('refills to 7 cards instead of 6 with the "first game" option (rules p.10)', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          ...filler(4, { type: LocationType.Hand, player: Corporation.Moon }),
          ...filler(5, { type: LocationType.Deck, player: Corporation.Moon })
        ]
      },
      { [Memory.FirstGame]: true }
    )
    playAll(rules, [rules.startRule(RuleId.EndTurn)]) // hand=4, target=7, deficit=3, deck has plenty
    expect(count(rules, LocationType.Hand)).toBe(7)
    expect(count(rules, LocationType.Deck)).toBe(2)
  })

  test('reshuffles the discard into the deck once it runs dry while still short a card', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          ...filler(4, { type: LocationType.Hand, player: Corporation.Moon }),
          ...filler(1, { type: LocationType.Deck, player: Corporation.Moon }),
          ...filler(3, { type: LocationType.Discard, player: Corporation.Moon })
        ]
      }
    )
    playAll(rules, [rules.startRule(RuleId.EndTurn)])
    expect(count(rules, LocationType.Hand)).toBe(6)
    expect(count(rules, LocationType.Deck)).toBe(2)
    expect(count(rules, LocationType.Discard)).toBe(0)
  })

  test('reshuffles the discard as soon as the deck is empty, even when it held exactly the cards needed', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          ...filler(4, { type: LocationType.Hand, player: Corporation.Moon }),
          ...filler(2, { type: LocationType.Deck, player: Corporation.Moon }),
          ...filler(3, { type: LocationType.Discard, player: Corporation.Moon })
        ]
      }
    )
    const consequences = rules.play(rules.customMove(CustomMoveType.Draw, { player: Corporation.Moon, quantity: 2 }))
    expect(consequences).toHaveLength(3)
    expect(isShuffle(consequences[2])).toBe(true)

    playAll(rules, consequences)
    expect(count(rules, LocationType.Hand)).toBe(6)
    expect(count(rules, LocationType.Deck)).toBe(3)
    expect(count(rules, LocationType.Discard)).toBe(0)
  })

  test('draws what it can and moves on when both the deck and the discard are empty', () => {
    const rules = testRules(
      { id: RuleId.EndTurn, player: Corporation.Moon },
      { [MaterialType.Card]: filler(3, { type: LocationType.Hand, player: Corporation.Moon }) }
    )
    playAll(rules, [rules.startRule(RuleId.EndTurn)])
    expect(count(rules, LocationType.Hand)).toBe(3)
    expect(rules.game.rule).toEqual(expect.objectContaining({ id: RuleId.PlayCards, player: Corporation.Star }))
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
    expect(rules.remind(Memory.Resources, Corporation.Moon)).toBeUndefined()
  })
})
