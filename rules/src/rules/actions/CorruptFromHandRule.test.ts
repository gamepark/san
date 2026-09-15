import { isMoveItemType } from '@gamepark/rules-api'
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

describe('CorruptFromHandRule', () => {
  test('offers to move any hand card into a free Corruption slot, at no cost', () => {
    const rules = testRules(
      { id: RuleId.CorruptFromHand, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }] },
      { [Memory.RepeatCount]: 1 }
    )
    const moves = rules.getLegalMoves(Corporation.Moon).filter(isMoveItemType(MaterialType.Card))
    // The one hand card can go to any of the 6 free Corruption Zone columns (rules, p.21: the player's choice).
    expect(moves).toHaveLength(6)
    expect(moves).toContainEqual(expect.objectContaining({ location: expect.objectContaining({ type: LocationType.CorruptionZone, x: 0, y: 0 }) }))
  })

  test('corrupting a card decrements RepeatCount and offers another one while cards and repeats remain', () => {
    const rules = testRules(
      { id: RuleId.CorruptFromHand, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.MoonHacking, location: { type: LocationType.Hand, player: Corporation.Moon } }
        ]
      },
      { [Memory.RepeatCount]: 2 }
    )
    rules.play(rules.startRule(RuleId.CorruptFromHand))
    const move = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.CorruptionZone, player: Corporation.Moon, x: 0, y: 0 })
    const consequences = rules.play(move)
    expect(consequences).toEqual([])
    expect(rules.remind(Memory.RepeatCount)).toBe(1)
  })

  test('corrupting the last allowed card finishes the effect', () => {
    const rules = testRules(
      { id: RuleId.CorruptFromHand, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }] },
      { [Memory.RepeatCount]: 1, [Memory.PendingEffects]: [{ type: EffectType.CorruptFromHand, value: 1 }] }
    )
    rules.play(rules.startRule(RuleId.CorruptFromHand))
    const move = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.CorruptionZone, player: Corporation.Moon, x: 0, y: 0 })
    const consequences = rules.play(move)
    expect(rules.remind(Memory.RepeatCount)).toBeUndefined()
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('finishes immediately when the hand is already empty', () => {
    const rules = testRules(
      { id: RuleId.CorruptFromHand, player: Corporation.Moon },
      {},
      { [Memory.PendingEffects]: [{ type: EffectType.CorruptFromHand, value: 1 }] }
    )
    const consequences = rules.play(rules.startRule(RuleId.CorruptFromHand))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('passing (the effect is optional) finishes it', () => {
    const rules = testRules(
      { id: RuleId.CorruptFromHand, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }] },
      { [Memory.PendingEffects]: [{ type: EffectType.CorruptFromHand, value: 1 }] }
    )
    rules.play(rules.startRule(RuleId.CorruptFromHand))
    const consequences = rules.play(rules.customMove(CustomMoveType.Pass))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })
})
