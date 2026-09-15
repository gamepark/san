import { isEndGame } from '@gamepark/rules-api'
import { describe, expect, test } from 'vitest'
import { Corporation } from './Corporation'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { SanCard } from './material/SanCard'
import { EMPTY_RESOURCES, Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'
import { VictoryType } from './rules/VictoryType'
import { victoryOutcome } from './rules/helper/victory'
import { testRules } from './tests/fixture'

/** 11 Corruption Zone cards for `player`: 5 full columns (0..4) plus one more at column 5. */
const elevenCorruptedCards = (player: Corporation) => {
  const items = []
  for (let x = 0; x < 5; x++) {
    items.push({ id: SanCard.RiverEquipment1, location: { type: LocationType.CorruptionZone, player, x, y: 0 } })
    items.push({ id: SanCard.RiverEquipment1, location: { type: LocationType.CorruptionZone, player, x, y: 1 } })
  }
  items.push({ id: SanCard.RiverEquipment1, location: { type: LocationType.CorruptionZone, player, x: 5, y: 0 } })
  return items
}

describe('SanRules — immediate victory conditions', () => {
  test('corrupting a 12th card wins by Corruption', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          ...elevenCorruptedCards(Corporation.Moon),
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } },
          { id: SanCard.RiverEquipment2, location: { type: LocationType.Reserve } } // keeps the River refill from also ending the game
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 3 } } }
    )
    const move = rules.material(MaterialType.Card).index(11).moveItem({ type: LocationType.CorruptionZone, player: Corporation.Moon, x: 5, y: 1 })
    const consequences = rules.play(move)
    expect(consequences.some(isEndGame)).toBe(true)
  })

  test('an 11th corrupted card does not end the game', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          ...elevenCorruptedCards(Corporation.Moon).slice(0, -1),
          { id: SanCard.RiverPropaganda1, location: { type: LocationType.River, x: 0 } },
          { id: SanCard.RiverEquipment2, location: { type: LocationType.Reserve } }
        ]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, corruption: 3 } } }
    )
    const move = rules.material(MaterialType.Card).index(10).moveItem({ type: LocationType.CorruptionZone, player: Corporation.Moon, x: 4, y: 1 })
    const consequences = rules.play(move)
    expect(consequences.some(isEndGame)).toBe(false)
  })

  test('the banner reaching the far end of the Propaganda track wins by Propaganda', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Banner]: [{ id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 5 } }] },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, propaganda: 10 } } } // generous: no River card to compute a real crossing cost against
    )
    const move = rules.material(MaterialType.Banner).moveItem({ type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 6 })
    const consequences = rules.play(move)
    expect(consequences.some(isEndGame)).toBe(true)
  })

  test('one step short of the far end does not end the game', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      { [MaterialType.Banner]: [{ id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 4 } }] },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, propaganda: 10 } } }
    )
    const move = rules.material(MaterialType.Banner).moveItem({ type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 5 })
    const consequences = rules.play(move)
    expect(consequences.some(isEndGame)).toBe(false)
  })

  test('driving off the opponent’s last Virus card wins by Hacking', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: 3 } }], // on Star's only (Virus5, 3 chips) card, last space
        [MaterialType.Card]: [{ id: SanCard.StarVirus5, location: { type: LocationType.VirusPile, player: Corporation.Star } }]
      },
      { [Memory.Resources]: { [Corporation.Moon]: { ...EMPTY_RESOURCES, virus: 1 } } }
    )
    const advance = rules.material(MaterialType.VirusPawn).moveItem({ type: LocationType.VirusTrack, x: 0 })
    const [driveOff] = rules.play(advance) // beforeItemMove's consequence: drive the last card off Star's pile
    const consequences = rules.play(driveOff) // the pile is now empty: SanRules.afterItemMove should end the game
    expect(consequences.some(isEndGame)).toBe(true)
  })
})

describe('SanRules — Reserve empty (rules p.22)', () => {
  test('rankPlayers / victoryOutcome pick the Corporation leading on at least 2 of the 3 progress criteria', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverEquipment1, location: { type: LocationType.CorruptionZone, player: Corporation.Moon, x: 0, y: 0 } }, // Moon leads Corruption
          // Moon drove off one of Star's Virus cards: Moon leads Hacking. Star's pile keeps its other 4.
          { id: SanCard.StarVirus2, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.StarVirus3, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.StarVirus4, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.StarVirus5, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.MoonVirus1, location: { type: LocationType.VirusPile, player: Corporation.Moon } },
          { id: SanCard.MoonVirus2, location: { type: LocationType.VirusPile, player: Corporation.Moon } },
          { id: SanCard.MoonVirus3, location: { type: LocationType.VirusPile, player: Corporation.Moon } },
          { id: SanCard.MoonVirus4, location: { type: LocationType.VirusPile, player: Corporation.Moon } },
          { id: SanCard.MoonVirus5, location: { type: LocationType.VirusPile, player: Corporation.Moon } }
        ],
        [MaterialType.Banner]: [
          { id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } },
          { id: Corporation.Star, location: { type: LocationType.PropagandaTrack, player: Corporation.Star, x: 5 } } // Star leads Propaganda (only)
        ],
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: 0 } }]
      }
    )
    const outcome = victoryOutcome(rules)
    expect(outcome).toEqual({ winner: Corporation.Moon, type: VictoryType.Reserve })
    expect(rules.rankPlayers(Corporation.Moon, Corporation.Star)).toBe(-1)
    expect(rules.rankPlayers(Corporation.Star, Corporation.Moon)).toBe(1)
  })

  test('rankPlayers / victoryOutcome return a tie when neither Corporation leads on 2 of the 3 criteria', () => {
    const rules = testRules(
      { id: RuleId.PlayCards, player: Corporation.Moon },
      {
        [MaterialType.Card]: [
          { id: SanCard.RiverEquipment1, location: { type: LocationType.CorruptionZone, player: Corporation.Moon, x: 0, y: 0 } }, // Moon leads Corruption
          // Both piles intact: Hacking is exactly tied (0 cards driven off on either side, pawn on the Central Port).
          { id: SanCard.StarVirus1, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.StarVirus2, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.StarVirus3, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.StarVirus4, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.StarVirus5, location: { type: LocationType.VirusPile, player: Corporation.Star } },
          { id: SanCard.MoonVirus1, location: { type: LocationType.VirusPile, player: Corporation.Moon } },
          { id: SanCard.MoonVirus2, location: { type: LocationType.VirusPile, player: Corporation.Moon } },
          { id: SanCard.MoonVirus3, location: { type: LocationType.VirusPile, player: Corporation.Moon } },
          { id: SanCard.MoonVirus4, location: { type: LocationType.VirusPile, player: Corporation.Moon } },
          { id: SanCard.MoonVirus5, location: { type: LocationType.VirusPile, player: Corporation.Moon } }
        ],
        [MaterialType.Banner]: [
          { id: Corporation.Moon, location: { type: LocationType.PropagandaTrack, player: Corporation.Moon, x: 0 } },
          { id: Corporation.Star, location: { type: LocationType.PropagandaTrack, player: Corporation.Star, x: 5 } } // Star leads Propaganda
        ],
        [MaterialType.VirusPawn]: [{ id: 1, location: { type: LocationType.VirusTrack, x: 0 } }]
      }
    )
    const outcome = victoryOutcome(rules)
    expect(outcome).toEqual({ winner: 0, type: VictoryType.Reserve })
    expect(rules.rankPlayers(Corporation.Moon, Corporation.Star)).toBe(0)
  })
})
