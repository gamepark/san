import { CardType, SanCard } from './SanCard'

/**
 * The effects a Mercenary or Equipment card can carry.
 *
 * Every value below is read straight from the printed cards in `app/src/images/cards` (the rulebook
 * only explains the icons, it never lists the numbers). Icon key:
 * - arrow  = Propaganda / Movement points
 * - skull  = Virus / Hacking points
 * - spiral = Corruption points
 * - "card +"      = Draw
 * - "res x card"  = Multiplier (gain `res` per card of that type played this turn)
 * - "a / b"       = Either (pick one side)
 * - dark "card X" = Single Use (cannot be declined, card goes back to the Box)
 * - white "card X"= Destroy a card from hand (put it in the Box)
 * - "card + trash / lines / closed eye / river / shapes" = the matching text effect below
 */
export enum EffectType {
  /** "Spiral": +value Corruption points for the turn. */
  Corruption = 1,
  /** "Arrow": +value Movement points for the turn. */
  Propaganda,
  /** "Skull": +value Virus points for the turn. */
  Virus,
  /** Gain `value` of `gain` for every card of type `per` played this turn (this card included). */
  Multiplier,
  /** At the end of the turn this card goes to the Box instead of the discard. Cannot be declined. */
  SingleUse,
  /** Copy the type and effects of another card played this turn. */
  CopyPlayed,
  /** Copy the type and effects of a card currently in the River. */
  CopyRiver,
  /** Put `value` cards from hand into the Box. */
  Destroy,
  /** Draw `value` cards from the deck (playable the same turn). */
  Draw,
  /** Lift the one-Mercenary-type-per-turn restriction for this turn. */
  AllTypes,
  /** Play a card from the discard. */
  PlayFromDiscard,
  /** Corrupt a card taken from hand (no group-of-3 cost). */
  CorruptFromHand,
  /** `option` holds the sub-effects to choose from (2, or 3 on the "any resource" cards). */
  Either
}

export interface CardEffect {
  type: EffectType
  value?: number
  /** {@link EffectType.Multiplier} only: which resource is gained. */
  gain?: EffectType.Corruption | EffectType.Propaganda | EffectType.Virus
  /** {@link EffectType.Multiplier} only: the card type that is counted. */
  per?: CardType
  /** {@link EffectType.Either} only: the sub-effects to choose from. */
  option?: CardEffect[]
}

export interface CardData {
  type: CardType
  effects: CardEffect[]
  /** Coins earned when the card is played. */
  revenue?: number
  /** Coins needed to buy the card from the River (River cards only). */
  cost?: number
  /** "Crossing cost": Movement points to cross this card on the Propaganda track (River cards only). */
  crossingCost?: number
}

const corruption = (value: number): CardEffect => ({ type: EffectType.Corruption, value })
const propaganda = (value: number): CardEffect => ({ type: EffectType.Propaganda, value })
const virus = (value: number): CardEffect => ({ type: EffectType.Virus, value })
const draw = (value: number): CardEffect => ({ type: EffectType.Draw, value })
const singleUse: CardEffect = { type: EffectType.SingleUse }
const either = (...option: CardEffect[]): CardEffect => ({ type: EffectType.Either, option })
const multiplier = (
  gain: EffectType.Corruption | EffectType.Propaganda | EffectType.Virus,
  per: CardType
): CardEffect => ({ type: EffectType.Multiplier, gain, per, value: 1 })

/**
 * The 8 starting-deck designs (3 copies each), from `cards/start/*.jpg`.
 * Each gives 1 point of its resource (Equipment: 1 point of any resource) and 1 Revenue.
 * Start cards have no crossing cost and are never bought, so no `cost` / `crossingCost`.
 */
const startCardsData: Record<SanCard, CardData> = {
  [SanCard.MoonPropaganda]: { type: CardType.Propaganda, effects: [propaganda(1)], revenue: 1 },
  [SanCard.MoonHacking]: { type: CardType.Hacking, effects: [virus(1)], revenue: 1 },
  [SanCard.MoonCorruption]: { type: CardType.Corruption, effects: [corruption(1)], revenue: 1 },
  [SanCard.MoonEquipment]: {
    type: CardType.Equipment,
    effects: [either(propaganda(1), virus(1), corruption(1))],
    revenue: 1
  },
  [SanCard.StarPropaganda]: { type: CardType.Propaganda, effects: [propaganda(1)], revenue: 1 },
  [SanCard.StarHacking]: { type: CardType.Hacking, effects: [virus(1)], revenue: 1 },
  [SanCard.StarCorruption]: { type: CardType.Corruption, effects: [corruption(1)], revenue: 1 },
  [SanCard.StarEquipment]: {
    type: CardType.Equipment,
    effects: [either(propaganda(1), virus(1), corruption(1))],
    revenue: 1
  }
} as Record<SanCard, CardData>

/**
 * The 33 River designs, from `cards/river/*.jpg`.
 * Crossing cost is fixed per colour: Propaganda 3, Corruption 5, Hacking 6, Equipment 4.
 * Mercenary designs 1..5 share a pattern: 1 = res1 + draw1, 2 = either(res2, draw2), 3 = res3,
 * 4 = multiplier (res per same-type card), 5 = res2 + draw2.
 */
const riverCardsData: Record<SanCard, CardData> = {
  // Propaganda — cards/river/Propaganda1..5.jpg — crossing cost 3
  [SanCard.RiverPropaganda1]: { type: CardType.Propaganda, effects: [propaganda(1), draw(1)], revenue: 4, cost: 2, crossingCost: 3 },
  [SanCard.RiverPropaganda2]: { type: CardType.Propaganda, effects: [either(propaganda(2), draw(2))], revenue: 1, cost: 3, crossingCost: 3 },
  [SanCard.RiverPropaganda3]: { type: CardType.Propaganda, effects: [propaganda(3)], revenue: 2, cost: 4, crossingCost: 3 },
  [SanCard.RiverPropaganda4]: { type: CardType.Propaganda, effects: [multiplier(EffectType.Propaganda, CardType.Propaganda)], revenue: 1, cost: 5, crossingCost: 3 },
  [SanCard.RiverPropaganda5]: { type: CardType.Propaganda, effects: [propaganda(2), draw(2)], revenue: 3, cost: 5, crossingCost: 3 },

  // Hacking — cards/river/Hacking1..5.jpg — crossing cost 6
  [SanCard.RiverHacking1]: { type: CardType.Hacking, effects: [virus(1), draw(1)], revenue: 2, cost: 2, crossingCost: 6 },
  [SanCard.RiverHacking2]: { type: CardType.Hacking, effects: [either(virus(2), draw(2))], revenue: 0, cost: 3, crossingCost: 6 },
  [SanCard.RiverHacking3]: { type: CardType.Hacking, effects: [virus(3)], revenue: 1, cost: 3, crossingCost: 6 },
  [SanCard.RiverHacking4]: { type: CardType.Hacking, effects: [multiplier(EffectType.Virus, CardType.Hacking)], revenue: 0, cost: 4, crossingCost: 6 },
  [SanCard.RiverHacking5]: { type: CardType.Hacking, effects: [virus(2), draw(2)], revenue: 1, cost: 5, crossingCost: 6 },

  // Corruption — cards/river/Corruption1..5.jpg — crossing cost 5
  [SanCard.RiverCorruption1]: { type: CardType.Corruption, effects: [corruption(1), draw(1)], revenue: 3, cost: 2, crossingCost: 5 },
  [SanCard.RiverCorruption2]: { type: CardType.Corruption, effects: [either(corruption(2), draw(2))], revenue: 1, cost: 2, crossingCost: 5 },
  [SanCard.RiverCorruption3]: { type: CardType.Corruption, effects: [corruption(3)], revenue: 1, cost: 2, crossingCost: 5 },
  [SanCard.RiverCorruption4]: { type: CardType.Corruption, effects: [multiplier(EffectType.Corruption, CardType.Corruption)], revenue: 1, cost: 3, crossingCost: 5 },
  [SanCard.RiverCorruption5]: { type: CardType.Corruption, effects: [corruption(2), draw(2)], revenue: 2, cost: 4, crossingCost: 5 },

  // Equipment — cards/river/Equipment1..18.jpg — crossing cost 4, revenue 0 (except Equipment1)
  [SanCard.RiverEquipment1]: { type: CardType.Equipment, effects: [draw(1)], revenue: 5, cost: 3, crossingCost: 4 },
  [SanCard.RiverEquipment2]: { type: CardType.Equipment, effects: [draw(3)], revenue: 0, cost: 4, crossingCost: 4 },
  [SanCard.RiverEquipment3]: { type: CardType.Equipment, effects: [{ type: EffectType.PlayFromDiscard }], revenue: 0, cost: 4, crossingCost: 4 },
  [SanCard.RiverEquipment4]: { type: CardType.Equipment, effects: [{ type: EffectType.CopyPlayed }], revenue: 0, cost: 5, crossingCost: 4 },
  [SanCard.RiverEquipment5]: { type: CardType.Equipment, effects: [propaganda(3)], revenue: 0, cost: 4, crossingCost: 4 },
  [SanCard.RiverEquipment6]: { type: CardType.Equipment, effects: [virus(3)], revenue: 0, cost: 4, crossingCost: 4 },
  [SanCard.RiverEquipment7]: { type: CardType.Equipment, effects: [corruption(3)], revenue: 0, cost: 4, crossingCost: 4 },
  [SanCard.RiverEquipment8]: { type: CardType.Equipment, effects: [{ type: EffectType.CorruptFromHand }], revenue: 0, cost: 4, crossingCost: 4 },
  [SanCard.RiverEquipment9]: { type: CardType.Equipment, effects: [draw(1), { type: EffectType.AllTypes }], revenue: 0, cost: 5, crossingCost: 4 },
  [SanCard.RiverEquipment10]: { type: CardType.Equipment, effects: [singleUse, draw(5)], revenue: 0, cost: 5, crossingCost: 4 },
  [SanCard.RiverEquipment11]: { type: CardType.Equipment, effects: [draw(1), { type: EffectType.Destroy, value: 1 }], revenue: 0, cost: 4, crossingCost: 4 },
  [SanCard.RiverEquipment12]: { type: CardType.Equipment, effects: [{ type: EffectType.Destroy, value: 2 }], revenue: 0, cost: 4, crossingCost: 4 },
  [SanCard.RiverEquipment13]: { type: CardType.Equipment, effects: [singleUse, { type: EffectType.Destroy, value: 6 }], revenue: 0, cost: 3, crossingCost: 4 },
  [SanCard.RiverEquipment14]: { type: CardType.Equipment, effects: [{ type: EffectType.CopyRiver }], revenue: 0, cost: 5, crossingCost: 4 },
  [SanCard.RiverEquipment15]: { type: CardType.Equipment, effects: [singleUse, propaganda(3), virus(3), corruption(3)], revenue: 0, cost: 5, crossingCost: 4 },
  [SanCard.RiverEquipment16]: { type: CardType.Equipment, effects: [singleUse, corruption(6)], revenue: 0, cost: 5, crossingCost: 4 },
  [SanCard.RiverEquipment17]: { type: CardType.Equipment, effects: [singleUse, propaganda(6)], revenue: 0, cost: 5, crossingCost: 4 },
  [SanCard.RiverEquipment18]: { type: CardType.Equipment, effects: [singleUse, virus(6)], revenue: 0, cost: 5, crossingCost: 4 }
} as Record<SanCard, CardData>

/** Every design that carries game data. Virus cards are absent on purpose (no type, no effect, no cost). */
export const cardsData: Partial<Record<SanCard, CardData>> = { ...startCardsData, ...riverCardsData }

export const getCardData = (card: SanCard): CardData | undefined => cardsData[card]

/** Virus cards ({@link SanCard.MoonVirus1} .. {@link SanCard.StarVirus5}) — played straight to the discard, no effect. */
export const isVirusCard = (card: SanCard): boolean => card >= SanCard.MoonVirus1 && card <= SanCard.StarVirus5

export const isMercenaryType = (type: CardType): boolean => type !== CardType.Equipment
