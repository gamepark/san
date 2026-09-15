import { isMoveItemType } from '@gamepark/rules-api'
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

describe('PlayFromDiscardRule', () => {
  test('offers to play a discarded card, restricted by the Mercenary type already locked this turn', () => {
    const rules = testRules(
      { id: RuleId.PlayFromDiscard, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.MoonPropaganda, location: { type: LocationType.Discard, player: Corporation.Moon } }, // Propaganda, locked out
          { id: SanCard.MoonEquipment, location: { type: LocationType.Discard, player: Corporation.Moon } } // Equipment, always playable
        ]
      },
      { [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, playedMercenaryType: 3 } } // CardType.Corruption already locked
    )
    const moves = rules.getLegalMoves(Corporation.Moon).filter(isMoveItemType(MaterialType.Card))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 1, location: { type: LocationType.PlayArea } })
  })

  test('playing a discarded card drops the PlayFromDiscard effect and queues the card’s own effects', () => {
    const rules = testRules(
      { id: RuleId.PlayFromDiscard, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Discard, player: Corporation.Moon } }] },
      { [Memory.PendingEffects]: [{ type: EffectType.PlayFromDiscard }] }
    )
    const move = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon })
    const consequences = rules.play(move)

    expect(rules.remind(Memory.PendingEffects)).toEqual([{ type: EffectType.Propaganda, value: 1 }])
    expect(rules.remind(Memory.Resources, Corporation.Moon).coins).toBe(1)
    expect(rules.remind(Memory.TurnFlags).cardPlayed).toBe(true)
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('finishes immediately when the discard has nothing playable', () => {
    const rules = testRules(
      { id: RuleId.PlayFromDiscard, player: Corporation.Moon },
      {},
      { [Memory.PendingEffects]: [{ type: EffectType.PlayFromDiscard }] }
    )
    const consequences = rules.play(rules.startRule(RuleId.PlayFromDiscard))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('passing (the effect is optional) finishes it', () => {
    const rules = testRules(
      { id: RuleId.PlayFromDiscard, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Discard, player: Corporation.Moon } }] },
      { [Memory.PendingEffects]: [{ type: EffectType.PlayFromDiscard }] }
    )
    rules.play(rules.startRule(RuleId.PlayFromDiscard))
    const consequences = rules.play(rules.customMove(CustomMoveType.Pass))
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
    expect(rules.material(MaterialType.Card).location(LocationType.Discard).player(Corporation.Moon).length).toBe(1) // untouched
  })
})
