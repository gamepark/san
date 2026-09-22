import { isCustomMoveType, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from './Corporation'
import { EffectType, getCardData } from './material/CardsData'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { CardType, SanCard, virusCards } from './material/SanCard'
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

  test('breaks a tie in favour of Hacking over a Corruption short of a group of 3', () => {
    // Nothing played yet this turn (no Mercenary type locked): both cards would be legal and equally
    // represented (1 each), but the single Corruption point cannot corrupt anything.
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

  // Moon's banner (step 0) crosses River column 5 first: a Propaganda3 card there costs 3 to cross.
  const tieGame = (...hand: SanCard[]) =>
    testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [{ id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } }],
        [MaterialType.Card]: [
          ...[0, 1, 2, 3, 4, 5].map((x) => ({ id: SanCard.RiverPropaganda3, location: { type: LocationType.River, x } })),
          ...hand.map((id) => ({ id, location: { type: LocationType.Hand, player: Corporation.Moon } }))
        ]
      }
    )
  const committedType = (game: ReturnType<typeof testGame>) => {
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    const types = new Set(moves.map((move) => isMoveItemType(MaterialType.Card)(move) && getCardData(game.items[MaterialType.Card]![move.itemIndex].id)?.type))
    expect(types.size).toBe(1)
    return [...types][0]
  }

  test('breaks a tie in favour of Propaganda when the banner crosses a step', () => {
    // 3 Propaganda points (Propaganda3) cross the cost-3 card; Corruption3 would also complete a group.
    expect(committedType(tieGame(SanCard.RiverPropaganda3, SanCard.RiverCorruption3, SanCard.MoonHacking))).toBe(CardType.Propaganda)
  })

  test('breaks a tie in favour of Corruption over Hacking when a group of 3 is complete, never a stuck Propaganda', () => {
    // 1 Propaganda point cannot cross the cost-3 card: the banner would stay stuck.
    expect(committedType(tieGame(SanCard.MoonPropaganda, SanCard.RiverCorruption3, SanCard.MoonHacking))).toBe(CardType.Corruption)
  })

  test('counts a Multiplier with every card of its type when checking a group of 3', () => {
    // Corruption4 gives 1 point per Corruption card played: 3 cards → 3 + 1 + 1 = 5 points.
    expect(
      committedType(
        tieGame(SanCard.RiverCorruption4, SanCard.MoonCorruption, SanCard.MoonCorruption, SanCard.MoonHacking, SanCard.MoonHacking, SanCard.MoonHacking)
      )
    ).toBe(CardType.Corruption)
  })

  test('commits to Corruption with a grey card still to resolve, then picks Corruption on it', () => {
    // The starting Equipment is played (its "any resource" pending): 2 Corruption cards + 1 = a group of 3.
    const game = tieGame(SanCard.MoonCorruption, SanCard.MoonCorruption, SanCard.MoonHacking, SanCard.MoonHacking)
    game.items[MaterialType.Card]!.push({ id: SanCard.MoonEquipment, location: { type: LocationType.PlayArea, player: Corporation.Moon } })
    const anyResource = [{ type: EffectType.Propaganda, value: 1 }, { type: EffectType.Virus, value: 1 }, { type: EffectType.Corruption, value: 1 }]
    game.memory[Memory.PendingEitherChoices] = [{ itemIndex: 10, options: anyResource }]
    game.memory[Memory.TurnFlags] = { ...EMPTY_TURN_FLAGS, cardPlayed: true }
    expect(committedType(game)).toBe(CardType.Corruption)

    // Both Corruption cards played; the front River card is now free to cross: Propaganda would advance
    // the banner, but the group of 3 is what the turn was committed for.
    const cards = game.items[MaterialType.Card]!
    cards[5].id = SanCard.MoonPropaganda
    cards[6].location = cards[7].location = { type: LocationType.PlayArea, player: Corporation.Moon }
    game.memory[Memory.TurnFlags] = { ...EMPTY_TURN_FLAGS, cardPlayed: true, playedMercenaryType: CardType.Corruption }
    game.memory[Memory.Resources] = { ...(game.memory[Memory.Resources] as object), [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 2 } }
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(1)
    expect(isCustomMoveType(CustomMoveType.ChooseEffectOption)(moves[0]) && moves[0].data).toEqual({ itemIndex: 10, option: 2 })
  })

  test('picks Corruption on two grey cards that complete a group of 3 only together', () => {
    // 1 Corruption card played + 2 starting Equipment cards pending: 1 + 1 + 1 = 3.
    const anyResource = [{ type: EffectType.Propaganda, value: 1 }, { type: EffectType.Virus, value: 1 }, { type: EffectType.Corruption, value: 1 }]
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [{ id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } }],
        [MaterialType.Card]: [
          ...[0, 1, 2, 3, 4, 5].map((x) => ({ id: SanCard.RiverPropaganda3, location: { type: LocationType.River, x } })),
          ...[SanCard.MoonEquipment, SanCard.MoonEquipment, SanCard.MoonCorruption].map((id) => ({
            id,
            location: { type: LocationType.PlayArea, player: Corporation.Moon }
          }))
        ]
      },
      {
        [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true, playedMercenaryType: CardType.Corruption },
        [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 1, virus: 0 } },
        [Memory.PendingEitherChoices]: [
          { itemIndex: 6, options: anyResource },
          { itemIndex: 7, options: anyResource }
        ]
      }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(1)
    expect(isCustomMoveType(CustomMoveType.ChooseEffectOption)(moves[0]) && moves[0].data).toEqual({ itemIndex: 6, option: 2 })
  })

  test('picks Propaganda on two grey cards that cross a banner step only together', () => {
    // 1 Propaganda card played + 2 starting Equipment cards pending: 1 + 1 + 1 = 3, the crossing cost.
    const anyResource = [{ type: EffectType.Propaganda, value: 1 }, { type: EffectType.Virus, value: 1 }, { type: EffectType.Corruption, value: 1 }]
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [{ id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } }],
        [MaterialType.Card]: [
          ...[0, 1, 2, 3, 4, 5].map((x) => ({ id: SanCard.RiverPropaganda3, location: { type: LocationType.River, x } })),
          ...[SanCard.MoonEquipment, SanCard.MoonEquipment, SanCard.MoonPropaganda].map((id) => ({
            id,
            location: { type: LocationType.PlayArea, player: Corporation.Moon }
          }))
        ]
      },
      {
        [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true, playedMercenaryType: CardType.Propaganda },
        [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, propaganda: 1 } },
        [Memory.PendingEitherChoices]: [
          { itemIndex: 6, options: anyResource },
          { itemIndex: 7, options: anyResource }
        ]
      }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(1)
    expect(isCustomMoveType(CustomMoveType.ChooseEffectOption)(moves[0]) && moves[0].data).toEqual({ itemIndex: 6, option: 0 })
  })

  test('prefers a lone Hacking card to more Propaganda cards leaving the banner stuck', () => {
    expect(committedType(tieGame(SanCard.MoonPropaganda, SanCard.MoonPropaganda, SanCard.MoonHacking))).toBe(CardType.Hacking)
  })

  test('prefers a lone Hacking card to more Corruption cards short of a group of 3', () => {
    expect(committedType(tieGame(SanCard.MoonCorruption, SanCard.MoonCorruption, SanCard.MoonHacking))).toBe(CardType.Hacking)
  })

  test('plays a stuck Propaganda when nothing better is in hand', () => {
    expect(committedType(tieGame(SanCard.MoonPropaganda, SanCard.MoonCorruption))).toBe(CardType.Propaganda)
  })

  test('never plays a Corruption short of a group of 3, playing its Virus card instead', () => {
    const moves = new SanBot(Corporation.Moon).getLegalMoves(tieGame(SanCard.MoonCorruption, SanCard.MoonVirus1))
    expect(moves).toHaveLength(1)
    expect(isMoveItemType(MaterialType.Card)(moves[0]) && moves[0].itemIndex).toBe(7)
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
    expect(isCustomMoveType(CustomMoveType.Draw)(moves[0])).toBe(true)
  })

  test('draws before committing to a Mercenary type from the discard', () => {
    const game = testGame(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverPropaganda3, location: { type: LocationType.Discard, player: Corporation.Moon, x: 0 } },
          { id: SanCard.MoonHacking, location: { type: LocationType.Deck, player: Corporation.Moon, x: 0 } }
        ]
      },
      {
        [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true },
        [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, draw: 1, playFromDiscard: 1 } }
      }
    )
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves).toHaveLength(1)
    expect(isCustomMoveType(CustomMoveType.Draw)(moves[0])).toBe(true)
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

  test('corrupts the cheap card in front of the opponent banner when the Reserve holds a costlier one', () => {
    // Column 0 (cost 3, in front of Star) is replaced by a cost-6 card; column 5 (in front of Moon) would get costlier.
    const game = corruptionGame(0)
    for (const item of game.items[MaterialType.Card]!) {
      if (item.location.type === LocationType.River) item.id = SanCard.RiverPropaganda3
      if (item.location.type === LocationType.Reserve) item.id = SanCard.RiverHacking1
    }
    const moves = new SanBot(Corporation.Moon).getLegalMoves(game)
    expect(moves.length).toBeGreaterThan(0)
    for (const move of moves) expect(move).toMatchObject({ itemIndex: 0 })
  })

  const buyGame = (reserve: SanCard) =>
    testGame(
      { id: RuleId.BuyCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [
          { id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } },
          { id: Corporation.Star, location: { type: LocationType.PropagandaTrack, player: Corporation.Star, x: 6 } }
        ],
        [MaterialType.Card]: [
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } },
          ...[1, 2, 3, 4].map((x) => ({ id: SanCard.RiverPropaganda3, location: { type: LocationType.River, x } })),
          { id: SanCard.RiverHacking1, location: { type: LocationType.River, x: 5 } },
          { id: reserve, location: { type: LocationType.Reserve, x: 0 } }
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, coins: 5 } } }
    )

  test('buys the cheap card whose replacement lowers the crossing in front of its banner over a pricier one', () => {
    // Hacking1 (price 2, crossing 6, in front of Moon) replaced by a crossing-3 card: 2 + 3 beats Propaganda3's price 4.
    const moves = new SanBot(Corporation.Moon).getLegalMoves(buyGame(SanCard.RiverPropaganda1))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 5 })
  })

  test('buys the cheap card whose replacement raises the crossing in front of the opponent banner', () => {
    // Propaganda1 (price 2, crossing 3, in front of Star) replaced by a crossing-6 card: 2 + 3 beats price 4;
    // Hacking1 in front of Moon would get no cheaper (2 + 0).
    const moves = new SanBot(Corporation.Moon).getLegalMoves(buyGame(SanCard.RiverHacking1))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 0 })
  })

  const revenueGame = (moonBannerX: number) =>
    testGame(
      { id: RuleId.BuyCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [
          { id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: moonBannerX } },
          { id: Corporation.Star, location: { type: LocationType.PropagandaTrack, player: Corporation.Star, x: 6 } }
        ],
        [MaterialType.Card]: [
          { id: SanCard.RiverEquipment1, location: { type: LocationType.River, x: 1 } },
          { id: SanCard.RiverPropaganda3, location: { type: LocationType.River, x: 3 } },
          { id: SanCard.RiverEquipment2, location: { type: LocationType.Reserve, x: 0 } },
          ...[Corporation.Moon, Corporation.Star].flatMap((player) =>
            virusCards[player].map((id, x) => ({ id, location: { type: LocationType.VirusPile, player, x } }))
          )
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, coins: 5 } } }
    )

  test('values the revenue of a card at the start of the game', () => {
    // Equipment1: price 3 + revenue 5 beats Propaganda3: price 4 + revenue 2.
    const moves = new SanBot(Corporation.Moon).getLegalMoves(revenueGame(0))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 0 })
  })

  test('no longer values the revenue of a card once a player is halfway to a victory', () => {
    // Moon's banner is halfway along its track: only the prices count, Propaganda3 (4) beats Equipment1 (3).
    const moves = new SanBot(Corporation.Moon).getLegalMoves(revenueGame(3))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 1 })
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
