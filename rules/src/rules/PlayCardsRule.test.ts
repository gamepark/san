import { isCustomMoveType, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { SanCard } from '../material/SanCard'
import { CustomMoveType } from './CustomMoveType'
import { EMPTY_RESOURCES, EMPTY_TURN_FLAGS, Memory } from './Memory'
import { RuleId } from './RuleId'
import { testRules } from '../tests/fixture'

describe('PlayCardsRule', () => {
  test('offers to play an Equipment card regardless of the Mercenary type already locked', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonEquipment, location: { type: LocationType.Hand, player: Corporation.Moon } }] },
      { [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, playedMercenaryType: 1 } }
    )
    const moves = rules.getLegalMoves(Corporation.Moon)
    expect(moves.some((move) => isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.PlayArea)).toBe(true)
  })

  test('does not offer a Mercenary card of a type other than the one already locked this turn', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }, // Propaganda type
          { id: SanCard.MoonHacking, location: { type: LocationType.Hand, player: Corporation.Moon } } // Hacking type, locked out
        ]
      },
      { [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, playedMercenaryType: 1 } } // CardType.Propaganda already locked
    )
    const moves = rules.getLegalMoves(Corporation.Moon).filter((move) => isMoveItemType(MaterialType.Card)(move))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ itemIndex: 0, location: { type: LocationType.PlayArea } })
  })

  test('sends a Virus card straight to the discard instead of the play area', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonVirus1, location: { type: LocationType.Hand, player: Corporation.Moon } }] }
    )
    const moves = rules.getLegalMoves(Corporation.Moon).filter((move) => isMoveItemType(MaterialType.Card)(move))
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ location: { type: LocationType.Discard } })
  })

  test('playing a card into the play area banks its revenue, locks its Mercenary type and queues its effects', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }] }
    )
    const move = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon })
    const consequences = rules.play(move)

    expect(rules.remind(Memory.Resources, Corporation.Moon).coins).toBe(1) // MoonPropaganda's revenue
    expect(rules.remind(Memory.TurnFlags).playedMercenaryType).toBe(1) // CardType.Propaganda
    expect(rules.remind(Memory.TurnFlags).cardPlayed).toBe(true)
    expect(rules.remind(Memory.PendingEffects)).toHaveLength(1) // propaganda(1) still queued
    expect(consequences).toEqual([rules.startRule(RuleId.ResolveEffects)])
  })

  test('a Virus card discarded from hand still counts as "a card played" this turn', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonVirus1, location: { type: LocationType.Hand, player: Corporation.Moon } }] }
    )
    const move = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.Discard, player: Corporation.Moon })
    rules.play(move)
    expect(rules.remind(Memory.TurnFlags).cardPlayed).toBe(true)
  })

  test('offers to corrupt a River card once 3 Corruption points are banked, and pays the group of 3', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } }] },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 3 } } }
    )
    const moves = rules.getLegalMoves(Corporation.Moon)
    const corrupt = moves.find(
      (move) => isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.CorruptionZone
    ) as MaterialMove | undefined
    expect(corrupt).toBeDefined()

    rules.play(corrupt!)
    expect(rules.remind(Memory.Resources, Corporation.Moon).corruption).toBe(0)
  })

  test('does not offer to corrupt with fewer than 3 Corruption points, even with flex points', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } }] },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 1, flex: 1 } } }
    )
    const moves = rules.getLegalMoves(Corporation.Moon)
    expect(moves.some((move) => isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.CorruptionZone)).toBe(false)
  })

  test('advances the Propaganda banner when its Movement points cover the crossing cost, and spends them', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [{ id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } }],
        // Moon starts at step 0 and crosses the River from its RIVER_SIZE-1 end first (RiverEquipment1: crossingCost 4).
        [MaterialType.Card]: [{ id: SanCard.RiverEquipment1, location: { type: LocationType.River, x: 5 } }]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, propaganda: 4 } } }
    )
    const moves = rules.getLegalMoves(Corporation.Moon)
    const advance = moves.find((move) => isMoveItemType(MaterialType.Banner)(move))
    expect(advance).toMatchObject({ location: { x: 1 } })

    rules.play(advance!)
    expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(0)
  })

  test('does not offer to advance the banner when Movement points do not cover the crossing cost', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Banner]: [{ id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } }],
        [MaterialType.Card]: [{ id: SanCard.RiverEquipment1, location: { type: LocationType.River, x: 5 } }]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, propaganda: 3 } } }
    )
    const moves = rules.getLegalMoves(Corporation.Moon)
    expect(moves.some((move) => isMoveItemType(MaterialType.Banner)(move))).toBe(false)
  })

  test('offers to advance and retreat the Virus pawn from the Central Port', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: 0 } }],
        [MaterialType.Card]: [
          { id: SanCard.StarVirus5, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.MoonVirus5, location: { type: LocationType.VirusPile, player: Corporation.Moon } }
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, virus: 1 } } }
    )
    const moves = rules
      .getLegalMoves(Corporation.Moon)
      .filter(isMoveItemType(MaterialType.VirusPawn))
      .map((move) => move.location.x)
      .sort()
    expect(moves).toEqual([-1, 1]) // retreat towards Moon's own card, advance towards Star's
  })

  test('advancing onto the Central Port from the opponent’s last space drives off their top Virus card', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: 3 } }], // on Star's only (Virus5, 3 chips) card, last space
        [MaterialType.Card]: [{ id: SanCard.StarVirus5, location: { type: LocationType.VirusPile, player: Corporation.Star } }]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, virus: 1 } } }
    )
    const move = rules.material(MaterialType.VirusPawn).moveItem({ type: LocationType.VirusTrack, x: 0 })
    const consequences = rules.play(move)

    expect(rules.remind(Memory.Resources, Corporation.Moon).virus).toBe(0)
    expect(consequences).toHaveLength(1)
    expect(consequences[0]).toMatchObject({ itemIndex: 0, location: { type: LocationType.Deck, player: Corporation.Star, x: 0 } })

    rules.play(consequences[0])
    expect(rules.material(MaterialType.Card).location(LocationType.VirusPile).player(Corporation.Star).length).toBe(0)
    expect(rules.material(MaterialType.Card).location(LocationType.Deck).player(Corporation.Star).length).toBe(1)
  })

  test('the driven-off Virus card lands on top of an already non-empty deck (rules p.19: "sur la pioche")', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: 3 } }], // on Star's only (Virus5, 3 chips) card, last space
        [MaterialType.Card]: [
          { id: SanCard.StarVirus5, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          // Star's deck already has 2 cards: the neutralized Virus card must end up drawn before both.
          { id: SanCard.StarPropaganda, location: { type: LocationType.Deck, player: Corporation.Star, x: 0 } },
          { id: SanCard.StarHacking, location: { type: LocationType.Deck, player: Corporation.Star, x: 1 } }
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, virus: 1 } } }
    )
    const move = rules.material(MaterialType.VirusPawn).moveItem({ type: LocationType.VirusTrack, x: 0 })
    const [driveOff] = rules.play(move)
    rules.play(driveOff)

    const deck = rules.material(MaterialType.Card).location(LocationType.Deck).player(Corporation.Star).getItems<SanCard>()
    expect(deck).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: SanCard.StarVirus5, location: expect.objectContaining({ x: 0 }) }),
        expect.objectContaining({ id: SanCard.StarPropaganda, location: expect.objectContaining({ x: 1 }) }),
        expect.objectContaining({ id: SanCard.StarHacking, location: expect.objectContaining({ x: 2 }) })
      ])
    )
  })

  test('retreating through the Central Port does not drive off any card', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: 1 } }], // on Moon's own card, about to retreat through the Port
        [MaterialType.Card]: [{ id: SanCard.StarVirus5, location: { type: LocationType.VirusPile, player: Corporation.Star } }]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, virus: 1 } } }
    )
    const move = rules.material(MaterialType.VirusPawn).moveItem({ type: LocationType.VirusTrack, x: 0 })
    expect(rules.play(move)).toEqual([])
    expect(rules.material(MaterialType.Card).location(LocationType.VirusPile).player(Corporation.Star).length).toBe(1)
  })

  test('a card played can only end the phase after at least one card was played this turn', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }] }
    )
    expect(rules.getLegalMoves(Corporation.Moon).some(isCustomMoveType(CustomMoveType.EndPlayPhase))).toBe(false)
  })

  test('a stuck player (no legal move at all) can end the phase without having played', () => {
    const rules = testRules({ id: RuleId.PlayCards, player: Corporation.Moon }, {})
    const moves = rules.getLegalMoves(Corporation.Moon)
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ type: CustomMoveType.EndPlayPhase })
  })

  test('ending the play phase moves to BuyCards', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {},
      { [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true } }
    )
    const consequences = rules.play(rules.customMove(CustomMoveType.EndPlayPhase))
    expect(consequences).toEqual([rules.startRule(RuleId.BuyCards)])
  })
})
