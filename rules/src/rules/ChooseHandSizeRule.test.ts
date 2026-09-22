import { describe, expect, test } from 'vitest'
import { Corporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { FREE_HAND_SIZE } from '../SanOptions'
import { SanRules } from '../SanRules'
import { SanSetup } from '../SanSetup'
import { playAll } from '../tests/fixture'
import { ChooseHandSizeData, CustomMoveType } from './CustomMoveType'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

const choose = (rules: SanRules, player: Corporation, size: number) =>
  playAll(rules, [rules.customMove(CustomMoveType.ChooseHandSize, { player, size } satisfies ChooseHandSizeData)])

const handOf = (rules: SanRules, player: Corporation) => rules.material(MaterialType.Card).location(LocationType.Hand).player(player).length

describe('ChooseHandSizeRule', () => {
  test('each player picks 6, 7 or 8 cards, then both hands are drawn and the starting player takes the first turn', () => {
    const game = new SanSetup().setup({ players: [{ id: Corporation.Moon }, { id: Corporation.Star }], handSize: FREE_HAND_SIZE })
    const startingPlayer = game.memory[Memory.StartingPlayer]
    const rules = new SanRules(game)
    expect(rules.getLegalMoves(Corporation.Moon)).toHaveLength(3)

    choose(rules, Corporation.Moon, 8)
    expect(rules.getLegalMoves(Corporation.Moon)).toHaveLength(0)
    expect(handOf(rules, Corporation.Moon)).toBe(0) // nothing is drawn until everyone has chosen
    expect(rules.game.rule?.id).toBe(RuleId.ChooseHandSize)

    choose(rules, Corporation.Star, 6)
    expect(handOf(rules, Corporation.Moon)).toBe(8)
    expect(handOf(rules, Corporation.Star)).toBe(6)
    expect(rules.remind(Memory.HandSize, Corporation.Moon)).toBe(8)
    expect(rules.remind(Memory.HandSize, Corporation.Star)).toBe(6)
    expect(rules.game.rule).toEqual({ id: RuleId.PlayCards, player: startingPlayer })
    expect(rules.remind(Memory.StartingPlayer)).toBeUndefined()
  })
})
