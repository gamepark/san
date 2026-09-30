import { Corporation } from '../Corporation'

/**
 * The 59 distinct card designs of San (51 images: Moon and Star start cards share theirs, see `MATERIAL.md`). The printed game has 82 physical cards: several designs are
 * printed in multiple copies (see {@link cardCopies} and `MATERIAL.md`).
 *
 * Colour ↔ type: blue = Propaganda, red = Hacking, yellow = Corruption, grey = Equipment.
 */
export enum SanCard {
  // 2x12 start cards: 2 copies of each design below, plus 1 copy of its "Revenue2" variant (appended at the end)
  MoonPropaganda = 1,
  MoonHacking,
  MoonCorruption,
  MoonEquipment,
  StarPropaganda,
  StarHacking,
  StarCorruption,
  StarEquipment,

  // 2x5 Virus cards (1 copy each), numbered after the count of Viruses still to come
  MoonVirus1,
  MoonVirus2,
  MoonVirus3,
  MoonVirus4,
  MoonVirus5,
  StarVirus1,
  StarVirus2,
  StarVirus3,
  StarVirus4,
  StarVirus5,

  // 48 River cards. Propaganda / Hacking / Corruption come in 2 copies each, Equipment in 1.
  RiverPropaganda1,
  RiverPropaganda2,
  RiverPropaganda3,
  RiverPropaganda4,
  RiverPropaganda5,
  RiverHacking1,
  RiverHacking2,
  RiverHacking3,
  RiverHacking4,
  RiverHacking5,
  RiverCorruption1,
  RiverCorruption2,
  RiverCorruption3,
  RiverCorruption4,
  RiverCorruption5,
  RiverEquipment1,
  RiverEquipment2,
  RiverEquipment3,
  RiverEquipment4,
  RiverEquipment5,
  RiverEquipment6,
  RiverEquipment7,
  RiverEquipment8,
  RiverEquipment9,
  RiverEquipment10,
  RiverEquipment11,
  RiverEquipment12,
  RiverEquipment13,
  RiverEquipment14,
  RiverEquipment15,
  RiverEquipment16,
  RiverEquipment17,
  RiverEquipment18,

  // The third copy of each start card: identical, except that it gives 2 Revenue instead of 1. Appended rather than
  // placed next to the other start cards so that the ids of the existing designs do not change.
  MoonPropagandaRevenue2,
  MoonHackingRevenue2,
  MoonCorruptionRevenue2,
  MoonEquipmentRevenue2,
  StarPropagandaRevenue2,
  StarHackingRevenue2,
  StarCorruptionRevenue2,
  StarEquipmentRevenue2
}

export enum CardType {
  Propaganda = 1,
  Hacking,
  Corruption,
  Equipment
}

/** The 8 start-card designs of each Corporation: 4 types × (Revenue 1 in 2 copies, Revenue 2 in 1 copy), see {@link cardCopies}. */
export const startCards: Record<Corporation, SanCard[]> = {
  [Corporation.Moon]: [
    SanCard.MoonPropaganda, SanCard.MoonHacking, SanCard.MoonCorruption, SanCard.MoonEquipment,
    SanCard.MoonPropagandaRevenue2, SanCard.MoonHackingRevenue2, SanCard.MoonCorruptionRevenue2, SanCard.MoonEquipmentRevenue2
  ],
  [Corporation.Star]: [
    SanCard.StarPropaganda, SanCard.StarHacking, SanCard.StarCorruption, SanCard.StarEquipment,
    SanCard.StarPropagandaRevenue2, SanCard.StarHackingRevenue2, SanCard.StarCorruptionRevenue2, SanCard.StarEquipmentRevenue2
  ]
}

/** The 5 Virus cards of each Corporation, ordered 1 → 5 (i.e. bottom → top of the setup stack). */
export const virusCards: Record<Corporation, SanCard[]> = {
  [Corporation.Moon]: [SanCard.MoonVirus1, SanCard.MoonVirus2, SanCard.MoonVirus3, SanCard.MoonVirus4, SanCard.MoonVirus5],
  [Corporation.Star]: [SanCard.StarVirus1, SanCard.StarVirus2, SanCard.StarVirus3, SanCard.StarVirus4, SanCard.StarVirus5]
}

/** The number printed on a Virus card (1 → 5, the count of viruses still to come). Only valid for Virus cards. */
export const virusNumber = (card: SanCard): number => ((card - SanCard.MoonVirus1) % 5) + 1

/** The 33 River card designs (48 physical cards once {@link cardCopies} is applied). */
export const riverCards: SanCard[] = [
  SanCard.RiverPropaganda1, SanCard.RiverPropaganda2, SanCard.RiverPropaganda3, SanCard.RiverPropaganda4, SanCard.RiverPropaganda5,
  SanCard.RiverHacking1, SanCard.RiverHacking2, SanCard.RiverHacking3, SanCard.RiverHacking4, SanCard.RiverHacking5,
  SanCard.RiverCorruption1, SanCard.RiverCorruption2, SanCard.RiverCorruption3, SanCard.RiverCorruption4, SanCard.RiverCorruption5,
  SanCard.RiverEquipment1, SanCard.RiverEquipment2, SanCard.RiverEquipment3, SanCard.RiverEquipment4, SanCard.RiverEquipment5,
  SanCard.RiverEquipment6, SanCard.RiverEquipment7, SanCard.RiverEquipment8, SanCard.RiverEquipment9, SanCard.RiverEquipment10,
  SanCard.RiverEquipment11, SanCard.RiverEquipment12, SanCard.RiverEquipment13, SanCard.RiverEquipment14, SanCard.RiverEquipment15,
  SanCard.RiverEquipment16, SanCard.RiverEquipment17, SanCard.RiverEquipment18
]

/**
 * Number of physical copies of a design. Any design not listed here has a single copy.
 * - start cards: 2 each for the Revenue 1 designs, 1 for the Revenue 2 ones (24 cards = 12 per Corporation)
 * - River Propaganda / Hacking / Corruption: 2 each (30 cards)
 * - everything else (Virus, River Equipment): 1
 */
export const cardCopies: Partial<Record<SanCard, number>> = {
  [SanCard.MoonPropaganda]: 2, [SanCard.MoonHacking]: 2, [SanCard.MoonCorruption]: 2, [SanCard.MoonEquipment]: 2,
  [SanCard.StarPropaganda]: 2, [SanCard.StarHacking]: 2, [SanCard.StarCorruption]: 2, [SanCard.StarEquipment]: 2,
  [SanCard.RiverPropaganda1]: 2, [SanCard.RiverPropaganda2]: 2, [SanCard.RiverPropaganda3]: 2, [SanCard.RiverPropaganda4]: 2, [SanCard.RiverPropaganda5]: 2,
  [SanCard.RiverHacking1]: 2, [SanCard.RiverHacking2]: 2, [SanCard.RiverHacking3]: 2, [SanCard.RiverHacking4]: 2, [SanCard.RiverHacking5]: 2,
  [SanCard.RiverCorruption1]: 2, [SanCard.RiverCorruption2]: 2, [SanCard.RiverCorruption3]: 2, [SanCard.RiverCorruption4]: 2, [SanCard.RiverCorruption5]: 2
}

export const getCardCopies = (card: SanCard): number => cardCopies[card] ?? 1
