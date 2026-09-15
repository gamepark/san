import { isCustomMoveType } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../../Corporation'
import { EffectType } from '../../material/CardsData'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { SanCard } from '../../material/SanCard'
import { CustomMoveType } from '../CustomMoveType'
import { EMPTY_TURN_FLAGS, Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { testRules } from '../../tests/fixture'

describe('CopyRiverRule', () => {
  test('offers to copy River cards, restricted by the Mercenary type already locked this turn', () => {
    const rules = testRules(
      { id: RuleId.CopyRiver, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverHacking1, location: { type: LocationType.River, x: 0 } }, // Hacking, locked out
          { id: SanCard.RiverEquipment1, location: { type: LocationType.River, x: 1 } } // Equipment, always copyable
        ]
      },
      { [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, playedMercenaryType: 1 } } // CardType.Propaganda already locked
    )
    const moves = rules.getLegalMoves(Corporation.Moon).filter(isCustomMoveType(CustomMoveType.CopyRiverCard))
    expect(moves).toHaveLength(1)
    expect(moves[0].data).toBe(1)
  })

  test('copying a card adopts its type and queues its effects in place of CopyRiver', () => {
    const rules = testRules(
      { id: RuleId.CopyRiver, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } }] },
      { [Memory.PendingEffects]: [{ type: EffectType.CopyRiver }] }
    )
    const consequences = rules.play(rules.customMove(CustomMoveType.CopyRiverCard, 0))

    expect(rules.remind(Memory.TurnFlags).playedMercenaryType).toBe(1) // CardType.Propaganda
    expect(rules.remind(Memory.PendingEffects)).toEqual([
      { type: EffectType.Propaganda, value: 1 },
      { type: EffectType.Draw, value: 1 }
    ])
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('copying a Single Use card flags the copying card itself, and drops the SingleUse marker from the queued effects', () => {
    const rules = testRules(
      { id: RuleId.CopyRiver, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverEquipment10, location: { type: LocationType.River, x: 0 } }] }, // [singleUse, draw(5)]
      { [Memory.PendingEffects]: [{ type: EffectType.CopyRiver }], [Memory.ResolvingCardIndex]: 3 }
    )
    rules.play(rules.customMove(CustomMoveType.CopyRiverCard, 0))

    expect(rules.remind(Memory.TurnFlags).singleUseCards).toEqual([3])
    expect(rules.remind(Memory.PendingEffects)).toEqual([{ type: EffectType.Draw, value: 5 }])
  })

  test('finishes immediately when no River card is copyable', () => {
    const rules = testRules({ id: RuleId.CopyRiver, player: Corporation.Moon }, {}, { [Memory.PendingEffects]: [{ type: EffectType.CopyRiver }] })
    const consequences = rules.play(rules.startRule(RuleId.CopyRiver))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('passing (the effect is optional) finishes it', () => {
    const rules = testRules(
      { id: RuleId.CopyRiver, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } }] },
      { [Memory.PendingEffects]: [{ type: EffectType.CopyRiver }] }
    )
    const consequences = rules.play(rules.customMove(CustomMoveType.Pass))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
    expect(rules.remind(Memory.TurnFlags)).toBeUndefined() // nothing was copied
  })
})
