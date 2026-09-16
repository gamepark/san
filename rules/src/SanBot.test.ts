import { isCustomMoveType, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from './Corporation'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CardType, SanCard } from './material/SanCard'
import { CustomMoveType } from './rules/CustomMoveType'
import { EMPTY_TURN_FLAGS, Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'
import { SanBot } from './SanBot'
import { SanRules } from './SanRules'
import { SanSetup } from './SanSetup'
import { testGame } from './tests/fixture'

function applyMove(rules: SanRules, move: MaterialMove<Corporation>) {
  const consequences = rules.play(move)
  for (const consequence of consequences) applyMove(rules, consequence)
}

function playBotGame(maxIterations: number) {
  const setup = new SanSetup()
  const state = setup.setup({ players: [{ id: Corporation.Moon }, { id: Corporation.Star }] })
  const rules = new SanRules(state)
  const bots = new Map(rules.game.players.map((player) => [player, new SanBot(player)]))

  let iterations = 0
  while (!rules.isOver() && iterations < maxIterations) {
    iterations++
    const player = rules.getActivePlayer()
    if (player === undefined) throw new Error(`No active player at iteration ${iterations}, rule=${JSON.stringify(rules.game.rule)}`)
    const moves = bots.get(player)!.run(rules.game)
    if (!moves.length) {
      throw new Error(`Bot found no move for player ${player} at iteration ${iterations}, rule=${JSON.stringify(rules.game.rule)}`)
    }
    for (const move of moves) applyMove(rules, move)
  }
  return { rules, iterations }
}

describe('SanBot', () => {
  test('plays full games without crashing', () => {
    for (let game = 0; game < 20; game++) {
      const { rules, iterations } = playBotGame(20000)
      expect(rules.isOver()).toBe(true)
      if (game === 0) console.log(`bot sample: finished in ${iterations} moves`)
    }
  })

  test('plays a Virus card rather than end the phase when it is the only playable card left', () => {
    // A card has already been played this turn, locking the turn to Hacking: the Propaganda card
    // in hand is not playable, only the Virus card is — plus the now-legal "end phase" move.
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.MoonVirus1, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.Hand, player: Corporation.Moon } }
        ]
      },
      { [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true, playedMercenaryType: CardType.Hacking } }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(1)
    expect(isMoveItemType(MaterialType.Card)(moves[0]) && moves[0].location.type === LocationType.Discard).toBe(true)
  })

  test('breaks a tie between two equally-represented Mercenary types in favour of Hacking', () => {
    // Nothing played yet this turn (no Mercenary type locked): both cards would be legal and equally
    // represented (1 each), but only the Hacking one is guaranteed not to waste its point (Corruption
    // needs a full group of 3).
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.MoonHacking, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.RiverCorruption1, location: { type: LocationType.Hand, player: Corporation.Moon } }
        ]
      }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(1)
    expect(isMoveItemType(MaterialType.Card)(moves[0]) && moves[0].itemIndex).toBe(0)
  })

  test('commits to the Mercenary type with the most cards in hand rather than a lone card of another type', () => {
    // 3 Propaganda cards vs. 1 Hacking card: committing to Hacking first would lock out the 3
    // Propaganda cards for the rest of the turn and strand them, so Propaganda must win despite the
    // tie-break rule above (which only applies when the counts are actually equal).
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.MoonHacking, location: { type: LocationType.Hand, player: Corporation.Moon } }
        ]
      }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(3)
    for (const move of moves) {
      expect(isMoveItemType(MaterialType.Card)(move) && move.itemIndex).not.toBe(3)
    }
  })

  test('keeps playing cards towards a threshold instead of randomly ending the phase early', () => {
    // A Propaganda card was already played this turn, locking the turn to that type: 2 more
    // Propaganda cards and an Equipment card can still be played (no resource action is affordable
    // yet), so the bot must not end the phase before exhausting them.
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.RiverEquipment5, location: { type: LocationType.Hand, player: Corporation.Moon } }
        ]
      },
      { [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true, playedMercenaryType: CardType.Propaganda } }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(3)
    expect(moves.some(isCustomMoveType(CustomMoveType.EndPlayPhase))).toBe(false)
  })
})
