import { MaterialMove, SecretMaterialRules } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../Corporation'
import { CardType, SanCard } from '../material/SanCard'
import { EffectType } from '../material/CardsData'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { EMPTY_RESOURCES, Memory } from './Memory'
import { RuleId } from './RuleId'
import { testRules } from '../tests/fixture'

/**
 * Constructing a fixture with `rule: { id: RuleId.ResolveEffects, ... }` only pre-sets the state; it
 * does not run `onRuleStart` (that only happens when the corresponding `RuleMove` is actually played
 * — see `MaterialRules.changeRule`). So every test here starts by playing that move, and asserts on
 * its returned consequences (further moves still need to be played to reach them, as in the sibling
 * `dragon-bomb` tests).
 */
const start = (rules: SecretMaterialRules<Corporation, MaterialType, LocationType>): MaterialMove[] => rules.play(rules.startRule(RuleId.ResolveEffects))

describe('ResolveEffectsRule', () => {
  test('a Corruption/Propaganda/Virus effect banks points and moves on to the next effect', () => {
    const rules = testRules(
      { id: RuleId.ResolveEffects, player: Corporation.Moon },
      {},
      { [Memory.PendingEffects]: [{ type: EffectType.Corruption, value: 2 }, { type: EffectType.Propaganda, value: 1 }] }
    )
    // Both effects resolve automatically in one onRuleStart pass (no player choice involved).
    const consequences = start(rules)
    expect(rules.remind(Memory.Resources, Corporation.Moon).corruption).toBe(2)
    expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(1)
    expect(rules.remind(Memory.PendingEffects)).toEqual([])
    expect(consequences).toEqual([rules.startRule(RuleId.PlayCards)])
  })

  test('registers a Multiplier and grants nothing until applyMultipliers sees matching cards', () => {
    const rules = testRules(
      { id: RuleId.ResolveEffects, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverPropaganda4, location: { type: LocationType.PlayArea, player: Corporation.Moon } }] },
      { [Memory.PendingEffects]: [{ type: EffectType.Multiplier, gain: EffectType.Propaganda, per: CardType.Propaganda, value: 1 }] }
    )
    // The card carrying the multiplier (RiverPropaganda4, itself Propaganda type) is already in the play area,
    // so applyMultipliers (called once the queue empties) immediately counts it.
    start(rules)
    expect(rules.remind(Memory.Multipliers)).toEqual([{ gain: EffectType.Propaganda, per: CardType.Propaganda, value: 1, counted: 1 }])
    expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(1)
  })

  test('lifts the one-Mercenary-type restriction on an AllTypes effect', () => {
    const rules = testRules({ id: RuleId.ResolveEffects, player: Corporation.Moon }, {}, { [Memory.PendingEffects]: [{ type: EffectType.AllTypes }] })
    start(rules)
    expect(rules.remind(Memory.TurnFlags).allTypesAllowed).toBe(true)
  })

  test('a SingleUse effect marker is a no-op here (flagging happens when the card is played)', () => {
    const rules = testRules({ id: RuleId.ResolveEffects, player: Corporation.Moon }, {}, { [Memory.PendingEffects]: [{ type: EffectType.SingleUse }] })
    const consequences = start(rules)
    expect(rules.remind(Memory.TurnFlags)).toBeUndefined()
    expect(rules.remind(Memory.PendingEffects)).toEqual([])
    expect(consequences).toEqual([rules.startRule(RuleId.PlayCards)])
  })

  test('an Either where every option is a plain resource gain feeds the flex pool without asking', () => {
    const rules = testRules(
      { id: RuleId.ResolveEffects, player: Corporation.Moon },
      {},
      {
        [Memory.PendingEffects]: [
          {
            type: EffectType.Either,
            option: [{ type: EffectType.Propaganda, value: 1 }, { type: EffectType.Virus, value: 1 }, { type: EffectType.Corruption, value: 1 }]
          }
        ]
      }
    )
    const consequences = start(rules)
    expect(rules.remind(Memory.Resources, Corporation.Moon).flex).toBe(1)
    expect(consequences).toEqual([rules.startRule(RuleId.PlayCards)])
  })

  test('a real Either (one option is not a resource gain) is handed to the player via ChooseEffect', () => {
    const rules = testRules(
      { id: RuleId.ResolveEffects, player: Corporation.Moon },
      {},
      { [Memory.PendingEffects]: [{ type: EffectType.Either, option: [{ type: EffectType.Propaganda, value: 2 }, { type: EffectType.Draw, value: 2 }] }] }
    )
    const consequences = start(rules)
    expect(consequences).toEqual([rules.startRule(RuleId.ChooseEffect)])
    expect(rules.remind(Memory.Resources, Corporation.Moon)).toBeUndefined() // no points banked yet, no choice made
    // The Either stays at the front of the queue until ChooseEffectRule picks a side.
    expect(rules.remind(Memory.PendingEffects)).toHaveLength(1)
  })

  test.each([
    [EffectType.Draw, RuleId.DrawCards],
    [EffectType.Destroy, RuleId.DestroyCard],
    [EffectType.PlayFromDiscard, RuleId.PlayFromDiscard],
    [EffectType.CorruptFromHand, RuleId.CorruptFromHand],
    [EffectType.CopyRiver, RuleId.CopyRiver]
  ])('an effect of type %i hands control to RuleId %i, keeping it at the front of the queue', (type, ruleId) => {
    const rules = testRules({ id: RuleId.ResolveEffects, player: Corporation.Moon }, {}, { [Memory.PendingEffects]: [{ type, value: 2 }] })
    const consequences = start(rules)
    expect(consequences).toEqual([rules.startRule(ruleId)])
    expect(rules.remind(Memory.PendingEffects)).toEqual([{ type, value: 2 }])
  })

  test('Draw and Destroy set the RepeatCount to the effect value', () => {
    const drawRules = testRules({ id: RuleId.ResolveEffects, player: Corporation.Moon }, {}, { [Memory.PendingEffects]: [{ type: EffectType.Draw, value: 3 }] })
    start(drawRules)
    expect(drawRules.remind(Memory.RepeatCount)).toBe(3)

    const destroyRules = testRules(
      { id: RuleId.ResolveEffects, player: Corporation.Moon },
      {},
      { [Memory.PendingEffects]: [{ type: EffectType.Destroy, value: 2 }] }
    )
    start(destroyRules)
    expect(destroyRules.remind(Memory.RepeatCount)).toBe(2)
  })

  test('an empty queue hands control back to PlayCards and tops up registered Multipliers first', () => {
    const rules = testRules(
      { id: RuleId.ResolveEffects, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverPropaganda4, location: { type: LocationType.PlayArea, player: Corporation.Moon } },
          { id: SanCard.MoonPropaganda, location: { type: LocationType.PlayArea, player: Corporation.Moon } }
        ]
      },
      {
        [Memory.PendingEffects]: [],
        [Memory.Multipliers]: [{ gain: EffectType.Propaganda, per: CardType.Propaganda, value: 1, counted: 1 }],
        [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, propaganda: 1 } }
      }
    )
    // A second Propaganda card entered the play area since the Multiplier last counted: +1 more point.
    const consequences = start(rules)
    expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(2)
    expect(rules.remind(Memory.Multipliers)).toEqual([{ gain: EffectType.Propaganda, per: CardType.Propaganda, value: 1, counted: 2 }])
    expect(consequences).toEqual([rules.startRule(RuleId.PlayCards)])
  })
})
