import { describe, expect, test } from 'vitest'
import { Corporation } from '../../Corporation'
import { EffectType } from '../../material/CardsData'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { SanCard } from '../../material/SanCard'
import { CustomMoveType } from '../CustomMoveType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { testRules } from '../../tests/fixture'

describe('DestroyCardRule', () => {
  test('destroying a card decrements RepeatCount and offers another one while cards and repeats remain', () => {
    const rules = testRules(
      { id: RuleId.DestroyCard, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.MoonHacking, location: { type: LocationType.Hand, player: Corporation.Moon } }
        ]
      },
      { [Memory.RepeatCount]: 2 }
    )
    rules.play(rules.startRule(RuleId.DestroyCard))
    const consequences = rules.play(rules.material(MaterialType.Card).index(0).deleteItem())
    expect(consequences).toEqual([])
    expect(rules.remind(Memory.RepeatCount)).toBe(1)
    expect(rules.material(MaterialType.Card).location(LocationType.Hand).player(Corporation.Moon).length).toBe(1)
  })

  test('destroying the last allowed card finishes the effect', () => {
    const rules = testRules(
      { id: RuleId.DestroyCard, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }] },
      { [Memory.RepeatCount]: 1, [Memory.PendingEffects]: [{ type: EffectType.Destroy, value: 1 }] }
    )
    rules.play(rules.startRule(RuleId.DestroyCard))
    const consequences = rules.play(rules.material(MaterialType.Card).index(0).deleteItem())
    expect(rules.remind(Memory.RepeatCount)).toBeUndefined()
    expect(rules.remind(Memory.PendingEffects)).toEqual([])
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('finishes immediately when the hand is already empty', () => {
    const rules = testRules({ id: RuleId.DestroyCard, player: Corporation.Moon }, {}, { [Memory.PendingEffects]: [{ type: EffectType.Destroy, value: 1 }] })
    const consequences = rules.play(rules.startRule(RuleId.DestroyCard))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('passing (the effect is optional) finishes it', () => {
    const rules = testRules(
      { id: RuleId.DestroyCard, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }] },
      { [Memory.PendingEffects]: [{ type: EffectType.Destroy, value: 1 }] }
    )
    rules.play(rules.startRule(RuleId.DestroyCard))
    const consequences = rules.play(rules.customMove(CustomMoveType.Pass))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
    expect(rules.material(MaterialType.Card).location(LocationType.Hand).player(Corporation.Moon).length).toBe(1) // untouched
  })
})
