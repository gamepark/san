import { isCustomMoveType } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../../Corporation'
import { EffectType } from '../../material/CardsData'
import { CustomMoveType } from '../CustomMoveType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { testRules } from '../../tests/fixture'

describe('ChooseEffectRule', () => {
  test('offers one move per option of the Either at the front of the queue', () => {
    const rules = testRules(
      { id: RuleId.ChooseEffect, player: Corporation.Moon },
      {},
      { [Memory.PendingEffects]: [{ type: EffectType.Either, option: [{ type: EffectType.Propaganda, value: 2 }, { type: EffectType.Draw, value: 2 }] }] }
    )
    const moves = rules.getLegalMoves(Corporation.Moon).filter(isCustomMoveType(CustomMoveType.ChooseEffectOption))
    expect(moves).toHaveLength(2)
    expect(moves.map((move) => move.data)).toEqual([0, 1])
  })

  test('picking an option replaces the Either with it and returns to ResolveEffects', () => {
    const rules = testRules(
      { id: RuleId.ChooseEffect, player: Corporation.Moon },
      {},
      {
        [Memory.PendingEffects]: [
          { type: EffectType.Either, option: [{ type: EffectType.Propaganda, value: 2 }, { type: EffectType.Draw, value: 2 }] }
        ]
      }
    )
    const consequences = rules.play(rules.customMove(CustomMoveType.ChooseEffectOption, 1))
    expect(rules.remind(Memory.PendingEffects)).toEqual([{ type: EffectType.Draw, value: 2 }])
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })
})
