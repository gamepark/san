import { Corporation } from '../Corporation'

/**
 * The 51 distinct card designs of San. The printed game has 82 physical cards: several designs are
 * printed in multiple copies (see {@link cardCopies} and `MATERIAL.md`).
 *
 * Colour ↔ type: blue = Propaganda, red = Hacking, yellow = Corruption, grey = Equipment.
 */
export enum SanCard {
  // 2x12 start cards (3 copies of each design, see cardCopies)
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
  RiverEquipment18
}

export enum CardType {
  Propaganda = 1,
  Hacking,
  Corruption,
  Equipment
}

/** The 4 start-card designs of each Corporation (3 physical copies of each, see {@link cardCopies}). */
export const startCards: Record<Corporation, SanCard[]> = {
  [Corporation.Moon]: [SanCard.MoonPropaganda, SanCard.MoonHacking, SanCard.MoonCorruption, SanCard.MoonEquipment],
  [Corporation.Star]: [SanCard.StarPropaganda, SanCard.StarHacking, SanCard.StarCorruption, SanCard.StarEquipment]
}

/** The 5 Virus cards of each Corporation, ordered 1 → 5 (i.e. bottom → top of the setup stack). */
export const virusCards: Record<Corporation, SanCard[]> = {
  [Corporation.Moon]: [SanCard.MoonVirus1, SanCard.MoonVirus2, SanCard.MoonVirus3, SanCard.MoonVirus4, SanCard.MoonVirus5],
  [Corporation.Star]: [SanCard.StarVirus1, SanCard.StarVirus2, SanCard.StarVirus3, SanCard.StarVirus4, SanCard.StarVirus5]
}

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
 * - start cards: 3 each (24 cards = 12 per Corporation)
 * - River Propaganda / Hacking / Corruption: 2 each (30 cards)
 * - everything else (Virus, River Equipment): 1
 */
export const cardCopies: Partial<Record<SanCard, number>> = {
  [SanCard.MoonPropaganda]: 3, [SanCard.MoonHacking]: 3, [SanCard.MoonCorruption]: 3, [SanCard.MoonEquipment]: 3,
  [SanCard.StarPropaganda]: 3, [SanCard.StarHacking]: 3, [SanCard.StarCorruption]: 3, [SanCard.StarEquipment]: 3,
  [SanCard.RiverPropaganda1]: 2, [SanCard.RiverPropaganda2]: 2, [SanCard.RiverPropaganda3]: 2, [SanCard.RiverPropaganda4]: 2, [SanCard.RiverPropaganda5]: 2,
  [SanCard.RiverHacking1]: 2, [SanCard.RiverHacking2]: 2, [SanCard.RiverHacking3]: 2, [SanCard.RiverHacking4]: 2, [SanCard.RiverHacking5]: 2,
  [SanCard.RiverCorruption1]: 2, [SanCard.RiverCorruption2]: 2, [SanCard.RiverCorruption3]: 2, [SanCard.RiverCorruption4]: 2, [SanCard.RiverCorruption5]: 2
}

export const getCardCopies = (card: SanCard): number => cardCopies[card] ?? 1
