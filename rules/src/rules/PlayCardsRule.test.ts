import { isCustomMoveType, isDeleteItemType, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { PROPAGANDA_END } from '../material/constants'
import { SanCard, virusCards } from '../material/SanCard'
import { CustomMoveType } from './CustomMoveType'
import { EMPTY_RESOURCES, EMPTY_TURN_FLAGS, Memory } from './Memory'
import { victoryOutcome } from './helper/victory'
import { RuleId } from './RuleId'
import { VictoryType } from './VictoryType'
import { playAll, testRules } from '../tests/fixture'

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

  test('playing a card into the play area banks its revenue, locks its Mercenary type and banks its effects as spendable charges', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.MoonPropaganda, location: { type: LocationType.Hand, player: Corporation.Moon } }] }
    )
    const move = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon })
    const consequences = rules.play(move)

    expect(rules.remind(Memory.Resources, Corporation.Moon).coins).toBe(1) // MoonPropaganda's revenue
    expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(1) // propaganda(1), banked immediately
    expect(rules.remind(Memory.TurnFlags).playedMercenaryType).toBe(1) // CardType.Propaganda
    expect(rules.remind(Memory.TurnFlags).cardPlayed).toBe(true)
    // No rule transition needed any more: the effect is banked, not queued for forced resolution.
    expect(consequences).toEqual([])
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

  test('corrupting a River card while the Reserve is empty ends the game on the Reserve tie-break', () => {
    // Full Virus piles, banners on their starting space, pawn on the Central Port: only Corruption differs.
    const virusPiles = [Corporation.Moon, Corporation.Star].flatMap((player) =>
      virusCards[player].map((id) => ({ id, location: { type: LocationType.VirusPile, player } }))
    )
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [{ id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } }, ...virusPiles],
        [MaterialType.Banner]: [
          { id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } },
          { id: Corporation.Star, location: { type: LocationType.PropagandaTrack, player: Corporation.Star, x: PROPAGANDA_END } }
        ],
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: 0 } }]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 3 } } }
    )
    playAll(rules, [rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.CorruptionZone, player: Corporation.Moon })])
    expect(rules.game.rule).toBeUndefined()
    expect(rules.material(MaterialType.Card).location(LocationType.CorruptionZone).player(Corporation.Moon).length).toBe(1)
    // Moon leads Corruption only, 1 condition out of 3: a tie.
    expect(victoryOutcome(rules)).toEqual({ winner: 0, type: VictoryType.Reserve })
  })

  test('the 12th corruption, taken from the River while the Reserve is empty, is a Corruption victory', () => {
    const corrupted = Array.from({ length: 11 }, () => ({ id: SanCard.MoonHacking, location: { type: LocationType.CorruptionZone, player: Corporation.Moon } }))
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } }, ...corrupted] },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 3 } } }
    )
    playAll(rules, [rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.CorruptionZone, player: Corporation.Moon })])
    expect(rules.game.rule).toBeUndefined()
    expect(victoryOutcome(rules)).toEqual({ winner: Corporation.Moon, type: VictoryType.Corruption })
  })

  test('does not offer to corrupt with fewer than 3 Corruption points', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Card]: [{ id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } }] },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 1 } } }
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

  const virusRules = (x: number, virus: number, starVirus = SanCard.StarVirus5) =>
    testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x } }],
        [MaterialType.Card]: [
          { id: starVirus, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.MoonVirus5, location: { type: LocationType.VirusPile, player: Corporation.Moon } }
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, virus } } }
    )
  const virusTargets = (rules: ReturnType<typeof testRules>) =>
    rules
      .getLegalMoves(Corporation.Moon)
      .filter(isMoveItemType(MaterialType.VirusPawn))
      .map((move) => move.location.x)
  const virusDriveOffs = (rules: ReturnType<typeof testRules>) =>
    rules
      .getLegalMoves(Corporation.Moon)
      .filter(isCustomMoveType(CustomMoveType.DriveOffVirus))

  test('only offers to advance the Virus pawn towards the opponent, never to retreat', () => {
    expect(virusTargets(virusRules(0, 1))).toEqual([1])
  })

  test('offers every space up to the opponent’s last one, as far as the banked points allow', () => {
    expect(virusTargets(virusRules(0, 2))).toEqual([1, 2])
    expect(virusTargets(virusRules(0, 3))).toEqual([1, 2, 3]) // Star's Virus 5 has 3 spaces: stops on the last one
  })

  test('driving the opponent’s top Virus card off is a single move, once the points cover its last space plus one', () => {
    expect(virusTargets(virusRules(0, 4))).toEqual([1, 2, 3])
    expect(virusDriveOffs(virusRules(0, 4))).toHaveLength(1)
  })

  test('driving off from afar hops one space at a time, spending one Skull point per space crossed, plus one', () => {
    const rules = virusRules(-1, 6)
    const hops = rules.play(rules.customMove(CustomMoveType.DriveOffVirus))
    expect(hops.map((hop) => isMoveItemType(MaterialType.VirusPawn)(hop) && hop.location.x)).toEqual([0, 1, 2, 3, 0])
    const driveOff = hops.flatMap((hop) => rules.play(hop))
    expect(rules.remind(Memory.Resources, Corporation.Moon).virus).toBe(1) // 1 (own card) + 3 (Star's Virus 5) + 1
    expect(driveOff).toEqual([expect.objectContaining({ location: { type: LocationType.Deck, player: Corporation.Star } })])
  })

  test('driving off from the Central Port still moves the pawn, instead of a move onto where it already stands', () => {
    const rules = virusRules(0, 4)
    expect(rules.play(rules.customMove(CustomMoveType.DriveOffVirus)).map((hop) => isMoveItemType(MaterialType.VirusPawn)(hop) && hop.location.x)).toEqual([1, 2, 3, 0])
  })

  test('counts the spaces from the player’s own card, through the Central Port', () => {
    expect(virusTargets(virusRules(-2, 5))).toEqual([-1, 0, 1, 2, 3])
    expect(virusDriveOffs(virusRules(-2, 5))).toEqual([])
  })

  test('advancing several spaces spends one Skull point per space', () => {
    const rules = virusRules(0, 5)
    rules.play(rules.material(MaterialType.VirusPawn).moveItem({ type: LocationType.VirusTrack, x: 3 }))
    expect(rules.remind(Memory.Resources, Corporation.Moon).virus).toBe(2)
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
    expect(consequences[0]).toMatchObject({ itemIndex: 0, location: { type: LocationType.Deck, player: Corporation.Star } })

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

    const deck = rules.material(MaterialType.Card).location(LocationType.Deck).player(Corporation.Star).deck()
    expect(deck.getItems<SanCard>().map((item) => item.id)).toEqual([SanCard.StarVirus5, SanCard.StarHacking, SanCard.StarPropaganda])
  })

  test('advancing through the Central Port from the player’s own card does not drive off any card', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: -1 } }], // on Moon's own card, about to cross the Port
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

  describe('card effects become banked, spend-whenever charges', () => {
    test('a Multiplier registers and grants nothing until a matching card is already in the play area', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.MoonPropaganda, location: { type: LocationType.PlayArea, player: Corporation.Moon } }, // already played, Propaganda type
            { id: SanCard.RiverPropaganda4, location: { type: LocationType.Hand, player: Corporation.Moon } } // multiplier(Propaganda, Propaganda)
          ]
        }
      )
      const move = rules.material(MaterialType.Card).index(1).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon })
      rules.play(move)
      // Both the pre-existing card and the Multiplier's own card count: +2.
      expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(2)
      expect(rules.remind(Memory.Multipliers)).toEqual([{ gain: 2, per: 1, value: 1, counted: 2 }]) // EffectType.Propaganda, CardType.Propaganda
    })

    test('an AllTypes effect lifts the one-Mercenary-type restriction immediately, with no counter', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        { [MaterialType.Card]: [{ id: SanCard.RiverEquipment9, location: { type: LocationType.Hand, player: Corporation.Moon } }] } // [draw(1), AllTypes]
      )
      const move = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon })
      rules.play(move)
      expect(rules.remind(Memory.TurnFlags).allTypesAllowed).toBe(true)
      expect(rules.remind(Memory.Resources, Corporation.Moon).draw).toBe(1) // the other effect on the same card still banks normally
    })

    test('a SingleUse effect flags the card for the box immediately, with no counter', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        { [MaterialType.Card]: [{ id: SanCard.RiverEquipment10, location: { type: LocationType.Hand, player: Corporation.Moon } }] } // [singleUse, draw(5)]
      )
      const move = rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon })
      rules.play(move)
      expect(rules.remind(Memory.TurnFlags).singleUseCards).toEqual([0])
      expect(rules.remind(Memory.Resources, Corporation.Moon).draw).toBe(5)
    })

    test('Draw banks a charge; spending it deals a card and decrements the charge', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.RiverEquipment2, location: { type: LocationType.Hand, player: Corporation.Moon } }, // draw(3)
            { id: SanCard.MoonHacking, location: { type: LocationType.Deck, player: Corporation.Moon } }
          ]
        }
      )
      rules.play(rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon }))
      expect(rules.remind(Memory.Resources, Corporation.Moon).draw).toBe(3)

      const draw = rules.getLegalMoves(Corporation.Moon).find(isCustomMoveType(CustomMoveType.Draw))
      expect(draw).toBeDefined()
      const consequences = rules.play(draw!)
      expect(rules.remind(Memory.Resources, Corporation.Moon).draw).toBe(2)
      playAll(rules, consequences)
      expect(rules.material(MaterialType.Card).location(LocationType.Hand).player(Corporation.Moon).length).toBe(1)
    })

    test('Draw is not offered on an empty deck, even with a banked charge', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {},
        { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, draw: 1 } } }
      )
      expect(rules.getLegalMoves(Corporation.Moon).some(isCustomMoveType(CustomMoveType.Draw))).toBe(false)
    })

    test('Destroy banks a charge; spending it deletes a hand card and decrements the charge', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.RiverEquipment11, location: { type: LocationType.Hand, player: Corporation.Moon } }, // Draw(1) + Destroy(1)
            { id: SanCard.MoonHacking, location: { type: LocationType.Hand, player: Corporation.Moon } }
          ]
        }
      )
      rules.play(rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon }))
      expect(rules.remind(Memory.Resources, Corporation.Moon).destroy).toBe(1)

      const destroy = rules.getLegalMoves(Corporation.Moon).find((move) => isDeleteItemType(MaterialType.Card)(move) && move.itemIndex === 1)
      expect(destroy).toBeDefined()
      rules.play(destroy!)
      expect(rules.remind(Memory.Resources, Corporation.Moon).destroy).toBe(0)
      expect(rules.material(MaterialType.Card).location(LocationType.Hand).player(Corporation.Moon).length).toBe(0)
    })

    test('CorruptFromHand banks a charge; spending it moves a hand card to a free slot at no cost, unlike a River corruption', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.RiverEquipment8, location: { type: LocationType.Hand, player: Corporation.Moon } }, // CorruptFromHand
            { id: SanCard.MoonHacking, location: { type: LocationType.Hand, player: Corporation.Moon } }
          ]
        }
      )
      rules.play(rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon }))
      expect(rules.remind(Memory.Resources, Corporation.Moon).corruptFromHand).toBe(1)

      const corrupt = rules
        .getLegalMoves(Corporation.Moon)
        .find((move) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === 1 && move.location.type === LocationType.CorruptionZone)
      expect(corrupt).toBeDefined()
      rules.play(corrupt!)
      // Free: unlike a River corruption, no 3-point group is spent (there isn't even any banked here).
      expect(rules.remind(Memory.Resources, Corporation.Moon).corruptFromHand).toBe(0)
      expect(rules.remind(Memory.Resources, Corporation.Moon).corruption).toBe(0)
      expect(rules.material(MaterialType.Card).location(LocationType.CorruptionZone).player(Corporation.Moon).length).toBe(1)
    })

    test('PlayFromDiscard banks a charge; spending it plays a discard card, whose own effects bank in turn', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.RiverEquipment3, location: { type: LocationType.Hand, player: Corporation.Moon } }, // PlayFromDiscard
            { id: SanCard.MoonPropaganda, location: { type: LocationType.Discard, player: Corporation.Moon } } // propaganda(1)
          ]
        }
      )
      rules.play(rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon }))
      expect(rules.remind(Memory.Resources, Corporation.Moon).playFromDiscard).toBe(1)

      const replay = rules
        .getLegalMoves(Corporation.Moon)
        .find((move) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === 1 && move.location.type === LocationType.PlayArea)
      expect(replay).toBeDefined()
      rules.play(replay!)
      expect(rules.remind(Memory.Resources, Corporation.Moon).playFromDiscard).toBe(0)
      expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(1) // the replayed card's own effect
      expect(rules.remind(Memory.Resources, Corporation.Moon).coins).toBe(1) // and its revenue
    })

    test('CopyRiver banks a charge; spending it applies the copied card\'s effects and locks its Mercenary type', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.RiverEquipment14, location: { type: LocationType.Hand, player: Corporation.Moon } }, // CopyRiver
            { id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } } // [propaganda(1), draw(1)]
          ]
        }
      )
      rules.play(rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon }))
      expect(rules.remind(Memory.Resources, Corporation.Moon).copyRiver).toBe(1)
      expect(rules.remind(Memory.CopyRiverSources)).toEqual([0]) // itemIndex 0 = the card carrying CopyRiver

      const copy = rules.getLegalMoves(Corporation.Moon).find(isCustomMoveType(CustomMoveType.CopyRiverCard))
      expect(copy).toBeDefined()
      rules.play(copy!)
      expect(rules.remind(Memory.Resources, Corporation.Moon).copyRiver).toBe(0)
      expect(rules.remind(Memory.CopyRiverSources)).toEqual([])
      expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(1)
      expect(rules.remind(Memory.Resources, Corporation.Moon).draw).toBe(1)
      expect(rules.remind(Memory.TurnFlags).playedMercenaryType).toBe(1) // CardType.Propaganda
    })

    test('copying a Single Use card flags the oldest still-unspent CopyRiver source (FIFO), not the copied card itself', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.RiverEquipment14, location: { type: LocationType.PlayArea, player: Corporation.Moon } }, // itemIndex 0, played first
            { id: SanCard.RiverEquipment16, location: { type: LocationType.River, x: 0 } } // itemIndex 1, [singleUse, corruption(6)]
          ]
        },
        { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, copyRiver: 2 } }, [Memory.CopyRiverSources]: [3, 5] }
      )
      const copy = rules.getLegalMoves(Corporation.Moon).find(isCustomMoveType(CustomMoveType.CopyRiverCard))
      rules.play(copy!)
      expect(rules.remind(Memory.CopyRiverSources)).toEqual([5]) // the oldest (3) was consumed
      expect(rules.remind(Memory.TurnFlags).singleUseCards).toEqual([3]) // not itemIndex 1, the copied River card
      expect(rules.remind(Memory.Resources, Corporation.Moon).corruption).toBe(6)
    })

    test('CopyPlayed banks a charge; spending it applies the effects of another card played this turn', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.RiverPropaganda5, location: { type: LocationType.PlayArea, player: Corporation.Moon } }, // [propaganda(2), draw(2)]
            { id: SanCard.RiverEquipment4, location: { type: LocationType.Hand, player: Corporation.Moon } } // CopyPlayed
          ]
        },
        { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, propaganda: 2, draw: 2 } } }
      )
      rules.play(rules.material(MaterialType.Card).index(1).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon }))
      expect(rules.remind(Memory.Resources, Corporation.Moon).copyPlayed).toBe(1)
      expect(rules.remind(Memory.CopyPlayedSources)).toEqual([1])

      // Only the Propaganda card can be copied: the CopyPlayed card itself is left out.
      const copies = rules.getLegalMoves(Corporation.Moon).filter(isCustomMoveType(CustomMoveType.CopyPlayedCard))
      expect(copies.map((move) => move.data)).toEqual([0])
      rules.play(copies[0])
      expect(rules.remind(Memory.Resources, Corporation.Moon).copyPlayed).toBe(0)
      expect(rules.remind(Memory.CopyPlayedSources)).toEqual([])
      expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(4)
      expect(rules.remind(Memory.Resources, Corporation.Moon).draw).toBe(4)
      expect(rules.getLegalMoves(Corporation.Moon).some(isCustomMoveType(CustomMoveType.CopyPlayedCard))).toBe(false)
    })

    test('copying a played Single Use card also sends the CopyPlayed card to the box', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {
          [MaterialType.Card]: [
            { id: SanCard.RiverEquipment16, location: { type: LocationType.PlayArea, player: Corporation.Moon } }, // [singleUse, corruption(6)]
            { id: SanCard.RiverEquipment4, location: { type: LocationType.PlayArea, player: Corporation.Moon } } // CopyPlayed
          ]
        },
        {
          [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 6, copyPlayed: 1 } },
          [Memory.TurnFlags]: { ...EMPTY_TURN_FLAGS, cardPlayed: true, singleUseCards: [0] },
          [Memory.CopyPlayedSources]: [1]
        }
      )
      rules.play(rules.getLegalMoves(Corporation.Moon).find(isCustomMoveType(CustomMoveType.CopyPlayedCard))!)
      expect(rules.remind(Memory.TurnFlags).singleUseCards).toEqual([0, 1])
      expect(rules.remind(Memory.Resources, Corporation.Moon).corruption).toBe(12)
    })

    test('a real Either (one option is not a resource gain) offers one button per option, tied to the card that granted it', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        { [MaterialType.Card]: [{ id: SanCard.RiverPropaganda2, location: { type: LocationType.Hand, player: Corporation.Moon } }] } // either(propaganda(2), draw(2))
      )
      rules.play(rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon }))
      expect(rules.remind(Memory.Resources, Corporation.Moon).coins).toBe(1) // the card's revenue, unrelated to its Either
      expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(0) // no points banked yet, no choice made
      expect(rules.remind(Memory.PendingEitherChoices)).toEqual([
        { itemIndex: 0, options: [{ type: 2, value: 2 }, { type: 9, value: 2 }] } // EffectType.Propaganda / EffectType.Draw
      ])

      const moves = rules.getLegalMoves(Corporation.Moon).filter(isCustomMoveType(CustomMoveType.ChooseEffectOption))
      expect(moves).toHaveLength(2)
      expect(moves.map((move) => move.data)).toEqual([
        { itemIndex: 0, option: 0 },
        { itemIndex: 0, option: 1 }
      ])

      rules.play(rules.customMove(CustomMoveType.ChooseEffectOption, { itemIndex: 0, option: 1 }))
      expect(rules.remind(Memory.PendingEitherChoices)).toEqual([])
      expect(rules.remind(Memory.Resources, Corporation.Moon).draw).toBe(2)
      expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(0)
    })

    test('the starting Equipment cards\' "any resource" Either also offers 3 buttons, crediting only the chosen resource', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        { [MaterialType.Card]: [{ id: SanCard.MoonEquipment, location: { type: LocationType.Hand, player: Corporation.Moon } }] } // either(propaganda(1), virus(1), corruption(1))
      )
      rules.play(rules.material(MaterialType.Card).index(0).moveItem({ type: LocationType.PlayArea, player: Corporation.Moon }))
      expect(rules.remind(Memory.Resources, Corporation.Moon).coins).toBe(1) // the card's revenue, unrelated to its Either
      expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(0) // no points banked yet, no choice made
      expect(rules.remind(Memory.PendingEitherChoices)).toEqual([
        { itemIndex: 0, options: [{ type: 2, value: 1 }, { type: 3, value: 1 }, { type: 1, value: 1 }] } // Propaganda / Virus / Corruption
      ])

      const moves = rules.getLegalMoves(Corporation.Moon).filter(isCustomMoveType(CustomMoveType.ChooseEffectOption))
      expect(moves).toHaveLength(3)

      rules.play(rules.customMove(CustomMoveType.ChooseEffectOption, { itemIndex: 0, option: 2 })) // Corruption
      expect(rules.remind(Memory.PendingEitherChoices)).toEqual([])
      expect(rules.remind(Memory.Resources, Corporation.Moon).corruption).toBe(1)
      expect(rules.remind(Memory.Resources, Corporation.Moon).propaganda).toBe(0)
      expect(rules.remind(Memory.Resources, Corporation.Moon).virus).toBe(0)
    })

    test('unspent charges and pending choices are wiped when a new PlayCards phase starts', () => {
      const rules = testRules(
        { id: RuleId.PlayCards, player: Corporation.Moon },
        {},
        {
          [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, draw: 3, destroy: 2 } },
          [Memory.PendingEitherChoices]: [{ itemIndex: 0, options: [] }],
          [Memory.CopyRiverSources]: [0]
        }
      )
      rules.play(rules.startRule(RuleId.PlayCards))
      expect(rules.remind(Memory.Resources, Corporation.Moon)).toEqual(EMPTY_RESOURCES)
      expect(rules.remind(Memory.PendingEitherChoices)).toBeUndefined()
      expect(rules.remind(Memory.CopyRiverSources)).toBeUndefined()
    })
  })
})
