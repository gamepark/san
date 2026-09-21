import { isCustomMoveType, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from './Corporation'
import { EffectType } from './material/CardsData'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CardType, SanCard } from './material/SanCard'
import { CustomMoveType } from './rules/CustomMoveType'
import { EMPTY_RESOURCES, EMPTY_TURN_FLAGS, Memory } from './rules/Memory'
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

  test('plays Equipment before Mercenary cards, and never ends the phase while a card can still be played', () => {
    // A Propaganda card was already played this turn, locking the turn to that type: 2 more
    // Propaganda cards and an Equipment card can still be played (no resource action is affordable yet).
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
    expect(moves).toHaveLength(1)
    expect(isMoveItemType(MaterialType.Card)(moves[0]) && moves[0].itemIndex).toBe(2)
  })

  test('draws before committing to a Mercenary type', () => {
    // An Equipment card was played (no type locked) and left a draw charge: the drawn card may change
    // which type is the best one, so the bot draws before playing its Propaganda card.
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.Hand, player: Corporation.Moon } },
          { id: SanCard.MoonHacking, location: { type: LocationType.Deck, player: Corporation.Moon, x: 0 } }
        ]
      },
      {
        [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true },
        [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, draw: 1 } }
      }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(1)
    expect(isCustomMoveType(CustomMoveType.DrawCard)(moves[0])).toBe(true)
  })

  const discardGame = (deck: boolean) =>
    testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverPropaganda3, location: { type: LocationType.Discard, player: Corporation.Moon, x: 0 } },
          ...(deck ? [{ id: SanCard.MoonHacking, location: { type: LocationType.Deck, player: Corporation.Moon, x: 0 } }] : [])
        ]
      },
      {
        [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true },
        [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, draw: 1, playFromDiscard: 1 } }
      }
    )

  test('draws before committing to a Mercenary type from the discard', () => {
    const moves = new SanBot(Corporation.Moon).getLegalMoves(discardGame(true))
    expect(moves).toHaveLength(1)
    expect(isCustomMoveType(CustomMoveType.DrawCard)(moves[0])).toBe(true)
  })

  test('plays from the discard first when the deck is empty, since drawing would reshuffle the discard', () => {
    const moves = new SanBot(Corporation.Moon).getLegalMoves(discardGame(false))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 0, location: { type: LocationType.PlayArea } })
  })

  // Moon's banner (step 0) crosses River column 5 first, Star's banner (step 6) crosses column 0 first.
  const corruptionGame = (propaganda: number) =>
    testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [
          { id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } },
          { id: Corporation.Star, location: { type: LocationType.PropagandaTrack, player: Corporation.Star, x: 6 } }
        ],
        [MaterialType.Card]: [
          ...[0, 1, 2, 3, 4, 5].map((x) => ({ id: SanCard.RiverHacking1, location: { type: LocationType.River, x } })),
          { id: SanCard.RiverPropaganda3, location: { type: LocationType.Reserve, x: 0 } }
        ]
      },
      {
        [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true },
        [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 3, propaganda } }
      }
    )

  test('corrupts the costly card in front of its banner when the Reserve holds a cheaper one, slot in front of the opponent', () => {
    // Column 5 (cost 6) is replaced by a cost-3 card: 3 points cross it with or without the discount,
    // so the corrupted card goes in front of Star's banner (column 0) to slow them down.
    const moves = new SanBot(Corporation.Moon).getLegalMoves(corruptionGame(3))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 5, location: { type: LocationType.CorruptionZone, x: 0 } })
  })

  test('puts the corrupted card in front of its own banner when the discount lets it advance right away', () => {
    // 2 points: the new cost-3 card is only crossable with the discount of a Corruption card facing it.
    const moves = new SanBot(Corporation.Moon).getLegalMoves(corruptionGame(2))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 5, location: { type: LocationType.CorruptionZone, x: 5 } })
  })

  test('picks Corruption on an "any resource" card when it completes a group of 3 and Propaganda would not advance', () => {
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [{ id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } }],
        [MaterialType.Card]: [
          { id: SanCard.RiverHacking1, location: { type: LocationType.River, x: 5 } },
          { id: SanCard.MoonEquipment, location: { type: LocationType.PlayArea, player: Corporation.Moon } }
        ]
      },
      {
        [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true },
        [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 2 } },
        [Memory.PendingEitherChoices]: [
          { itemIndex: 1, options: [{ type: EffectType.Propaganda, value: 1 }, { type: EffectType.Virus, value: 1 }, { type: EffectType.Corruption, value: 1 }] }
        ]
      }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(1)
    expect(isCustomMoveType(CustomMoveType.ChooseEffectOption)(moves[0]) && moves[0].data).toEqual({ itemIndex: 1, option: 2 })
  })
})
