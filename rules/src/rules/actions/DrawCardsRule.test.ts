import { isMoveItemsAtOnce, isShuffle } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../../Corporation'
import { EffectType } from '../../material/CardsData'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { SanCard } from '../../material/SanCard'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { testRules } from '../../tests/fixture'

describe('DrawCardsRule', () => {
  test('deals one card, decrements RepeatCount and loops back onto itself', () => {
    const rules = testRules(
      { id: RuleId.DrawCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Deck, player: Corporation.Moon } }] },
      { [Memory.RepeatCount]: 2 }
    )
    const consequences = rules.play(rules.startRule(RuleId.DrawCards))
    expect(rules.remind(Memory.RepeatCount)).toBe(1)
    expect(consequences).toHaveLength(2)
    expect(consequences[1]).toEqual(rules.startRule(RuleId.DrawCards))

    rules.play(consequences[0])
    expect(rules.material(MaterialType.Card).location(LocationType.Hand).player(Corporation.Moon).length).toBe(1)
    expect(rules.material(MaterialType.Card).location(LocationType.Deck).player(Corporation.Moon).length).toBe(0)
  })

  test('reshuffles the discard into the deck once it runs dry, then loops back to keep drawing', () => {
    const rules = testRules(
      { id: RuleId.DrawCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.MoonPropaganda, location: { type: LocationType.Discard, player: Corporation.Moon } },
          { id: SanCard.MoonHacking, location: { type: LocationType.Discard, player: Corporation.Moon } }
        ]
      },
      { [Memory.RepeatCount]: 1 }
    )
    const consequences = rules.play(rules.startRule(RuleId.DrawCards))
    expect(consequences).toHaveLength(3)
    expect(isMoveItemsAtOnce(consequences[0])).toBe(true)
    expect(isShuffle(consequences[1])).toBe(true)
    expect(consequences[2]).toEqual(rules.startRule(RuleId.DrawCards))

    rules.play(consequences[0])
    rules.play(consequences[1])
    expect(rules.material(MaterialType.Card).location(LocationType.Deck).player(Corporation.Moon).length).toBe(2)
    expect(rules.material(MaterialType.Card).location(LocationType.Discard).player(Corporation.Moon).length).toBe(0)
  })

  test('gives up and finishes the effect once both the deck and the discard are empty', () => {
    const rules = testRules(
      { id: RuleId.DrawCards, player: Corporation.Moon },
      {},
      { [Memory.RepeatCount]: 1, [Memory.PendingEffects]: [{ type: EffectType.Draw, value: 3 }] } // EffectType.Draw still at the front
    )
    const consequences = rules.play(rules.startRule(RuleId.DrawCards))
    expect(rules.remind(Memory.RepeatCount)).toBeUndefined()
    expect(rules.remind(Memory.PendingEffects)).toEqual([])
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('finishes the effect immediately when the RepeatCount is already exhausted', () => {
    const rules = testRules(
      { id: RuleId.DrawCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Deck, player: Corporation.Moon } }] },
      { [Memory.RepeatCount]: 0, [Memory.PendingEffects]: [{ type: EffectType.Draw, value: 3 }] }
    )
    const consequences = rules.play(rules.startRule(RuleId.DrawCards))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
    expect(rules.material(MaterialType.Card).location(LocationType.Deck).player(Corporation.Moon).length).toBe(1) // untouched
  })
})
