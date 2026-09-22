import { describe, expect, test } from 'vitest'
import { Corporation } from './Corporation'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'
import { FREE_HAND_SIZE } from './SanOptions'
import { SanSetup } from './SanSetup'

const setupGame = (handSize: number) => new SanSetup().setup({ players: [{ id: Corporation.Moon }, { id: Corporation.Star }], handSize })

const handOf = (game: ReturnType<typeof setupGame>, player: Corporation) =>
  game.items[MaterialType.Card]!.filter((item) => item.location.type === LocationType.Hand && item.location.player === player)

describe('SanSetup', () => {
  test.each([6, 7])('deals and memorizes a %i-card starting hand when the host imposes it', (handSize) => {
    const game = setupGame(handSize)
    for (const player of game.players) {
      expect(handOf(game, player)).toHaveLength(handSize)
      expect(game.memory[Memory.HandSize][player]).toBe(handSize)
    }
    expect(game.rule?.id).toBe(RuleId.PlayCards)
  })

  test('deals no hand and lets each player choose its size with the "free" option', () => {
    const game = setupGame(FREE_HAND_SIZE)
    for (const player of game.players) expect(handOf(game, player)).toHaveLength(0)
    expect(game.rule?.id).toBe(RuleId.ChooseHandSize)
    expect(game.rule?.players).toEqual(game.players)
  })
})
