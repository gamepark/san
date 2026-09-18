import { describe, expect, test } from 'vitest'
import { Corporation } from './Corporation'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { SanSetup } from './SanSetup'

const setupGame = (firstGame: boolean) =>
  new SanSetup().setup({ players: [{ id: Corporation.Moon }, { id: Corporation.Star }], firstGame })

describe('SanSetup', () => {
  test('deals a 6-card starting hand by default', () => {
    const game = setupGame(false)
    const cards = game.items[MaterialType.Card]!
    for (const player of game.players) {
      expect(cards.filter((item) => item.location.type === LocationType.Hand && item.location.player === player)).toHaveLength(6)
    }
  })

  test('deals a 7-card starting hand with the "first game" option (rules p.10)', () => {
    const game = setupGame(true)
    const cards = game.items[MaterialType.Card]!
    for (const player of game.players) {
      expect(cards.filter((item) => item.location.type === LocationType.Hand && item.location.player === player)).toHaveLength(7)
    }
  })
})
