import { MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { Corporation, otherCorporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CardEffect, EffectType, getCardData, isMercenaryType } from '../material/CardsData'
import { CORRUPTION_SLOT_CAPACITY, CORRUPTION_SLOTS, virusCardChips } from '../material/constants'
import { CardType, SanCard, virusNumber } from '../material/SanCard'
import { clone } from './clone'
import { ResourcesHelper } from './helper/ResourcesHelper'
import { TurnFlagsHelper } from './helper/TurnFlagsHelper'
import { Memory } from './Memory'

/** Which resource counter an {@link EffectType.Corruption}/{@link EffectType.Propaganda}/{@link EffectType.Virus} feeds. */
const POINTS_KEY = {
  [EffectType.Corruption]: 'corruption',
  [EffectType.Propaganda]: 'propaganda',
  [EffectType.Virus]: 'virus'
} as const

/** A Multiplier played this turn, plus how many matching cards it has already paid out for. */
interface MultiplierState {
  gain: EffectType.Corruption | EffectType.Propaganda | EffectType.Virus
  per: CardType
  value: number
  counted: number
}

/**
 * Shared helpers for every rule of a player turn: access to the player's piles and the effect
 * application logic for a card just played. Resources and turn flags live in their own {@link
 * ResourcesHelper} / {@link TurnFlagsHelper} (see `./helper`).
 */
export abstract class SanRule extends PlayerTurnRule<Corporation, MaterialType, LocationType> {
  resourcesHelper = new ResourcesHelper(this.game, this.player)
  turnFlagsHelper = new TurnFlagsHelper(this.game)

  get hand() {
    return this.material(MaterialType.Card).location(LocationType.Hand).player(this.player)
  }

  get playArea() {
    return this.material(MaterialType.Card).location(LocationType.PlayArea).player(this.player)
  }

  get discard() {
    return this.material(MaterialType.Card).location(LocationType.Discard).player(this.player)
  }

  get deck() {
    return this.material(MaterialType.Card).location(LocationType.Deck).player(this.player)
  }

  get river() {
    return this.material(MaterialType.Card).location(LocationType.River)
  }

  /** A Corporation's stack of Virus cards, still on the board (driven-off cards leave for its deck). */
  virusPile(player: Corporation) {
    return this.material(MaterialType.Card).location(LocationType.VirusPile).player(player)
  }

  /** The other Corporation (the one the active player attacks along the Virus track). */
  get virusOpponent(): Corporation {
    return otherCorporation(this.player)
  }

  /** Highest Virus number still on a Corporation's pile (5 at setup, 0 once every card is driven off). */
  topVirusNumber(player: Corporation): number {
    const numbers = this.virusPile(player).getItems<SanCard>().map((item) => virusNumber(item.id))
    return numbers.length ? Math.max(...numbers) : 0
  }

  /** Standable advancement spaces on a Corporation's current top Virus card (0 if its pile is empty). */
  virusChips(player: Corporation): number {
    const top = this.topVirusNumber(player)
    return top === 0 ? 0 : virusCardChips(top)
  }

  get reserve() {
    return this.material(MaterialType.Card).location(LocationType.Reserve)
  }

  /** Move the whole discard pile back onto the deck and shuffle it — the deck ran dry mid-deal. */
  reshuffleDiscardIntoDeck(): MaterialMove[] {
    return [this.discard.moveItemsAtOnce({ type: LocationType.Deck, player: this.player }), this.discard.shuffle()]
  }

  /**
   * Register a card that just entered the play area: bank its revenue, lock the Mercenary type,
   * flag it for the box if it is Single Use, then apply each of its effects immediately (they turn
   * into banked, optional-to-spend resources — see {@link applyEffect} — except Multiplier/SingleUse/
   * AllTypes, which have no "spend" moment and stay fully automatic).
   */
  playCardEffects(itemIndex: number): MaterialMove[] {
    this.turnFlagsHelper.setCardPlayed()
    const id = this.material(MaterialType.Card).getItem<SanCard>(itemIndex).id
    const data = getCardData(id)
    if (!data) return []

    if (data.revenue) this.resourcesHelper.addPoints('coins', data.revenue)
    if (isMercenaryType(data.type)) this.turnFlagsHelper.lockMercenaryType(data.type)

    const effects = clone(data.effects)
    if (effects.some((effect) => effect.type === EffectType.SingleUse)) {
      this.turnFlagsHelper.addSingleUseCard(itemIndex)
    }
    for (const effect of effects) this.applyEffect(itemIndex, effect)
    this.applyMultipliers()
    return []
  }

  /**
   * Apply one card effect: resource gains bank immediately (their *use* is what stays optional —
   * see {@link import('./PlayCardsRule').PlayCardsRule}'s `drawMoves`/`destroyMoves`/etc.), while
   * Multiplier/SingleUse/AllTypes apply outright since they have no discrete "moment of use".
   * `itemIndex` is the played card that granted the effect — needed to track which card a CopyRiver
   * charge came from (see {@link import('./Memory').Memory.CopyRiverSources}) and, for Either, which
   * card the pending choice belongs to.
   */
  applyEffect(itemIndex: number, effect: CardEffect): void {
    switch (effect.type) {
      case EffectType.Corruption:
      case EffectType.Propaganda:
      case EffectType.Virus:
        this.resourcesHelper.addPoints(POINTS_KEY[effect.type], effect.value ?? 0)
        break

      case EffectType.Multiplier: {
        const multipliers = this.remind<MultiplierState[]>(Memory.Multipliers) ?? []
        multipliers.push({ gain: effect.gain!, per: effect.per!, value: effect.value ?? 1, counted: 0 })
        this.memorize(Memory.Multipliers, multipliers)
        break
      }

      case EffectType.AllTypes:
        this.turnFlagsHelper.setAllTypesAllowed()
        break

      case EffectType.SingleUse:
      case EffectType.CopyPlayed: // unused by the printed cards
        break

      case EffectType.Draw:
        this.resourcesHelper.addPoints('draw', effect.value ?? 1)
        break

      case EffectType.Destroy:
        this.resourcesHelper.addPoints('destroy', effect.value ?? 1)
        break

      case EffectType.CorruptFromHand:
        this.resourcesHelper.addPoints('corruptFromHand', effect.value ?? 1)
        break

      case EffectType.PlayFromDiscard:
        this.resourcesHelper.addPoints('playFromDiscard', 1)
        break

      case EffectType.CopyRiver: {
        this.resourcesHelper.addPoints('copyRiver', 1)
        const sources = this.remind<number[]>(Memory.CopyRiverSources) ?? []
        sources.push(itemIndex)
        this.memorize(Memory.CopyRiverSources, sources)
        break
      }

      case EffectType.Either: {
        // Every "either / or" — including the starting Equipment cards' "gain any resource" (in
        // practice a plain 3-way choice between Corruption/Propaganda/Hacking) — waits for the
        // player to pick a side; see PlayCardsRule.eitherChoiceMoves.
        const pending = this.remind<{ itemIndex: number; options: CardEffect[] }[]>(Memory.PendingEitherChoices) ?? []
        pending.push({ itemIndex, options: effect.option! })
        this.memorize(Memory.PendingEitherChoices, pending)
        break
      }
    }
  }

  /**
   * Bring every Multiplier played this turn up to date with the cards now in the play area, so a
   * Multiplier ends up counting every matching card of the turn whatever the order it was played in
   * (rules, p.20: "autant de fois que de cartes jouées lors de ce tour"). Must run after every card
   * enters the play area (hand, PlayFromDiscard or CopyRiver alike).
   */
  applyMultipliers(): void {
    const multipliers = this.remind<MultiplierState[]>(Memory.Multipliers)
    if (!multipliers?.length) return
    for (const multiplier of multipliers) {
      const played = this.countPlayed(multiplier.per)
      if (played > multiplier.counted) {
        this.resourcesHelper.addPoints(POINTS_KEY[multiplier.gain], (played - multiplier.counted) * multiplier.value)
        multiplier.counted = played
      }
    }
    this.memorize(Memory.Multipliers, multipliers)
  }

  /** Cards of that type already played this turn (the card carrying the multiplier is among them). */
  countPlayed(type: CardType): number {
    return this.playArea.getItems<SanCard>().filter((item) => getCardData(item.id)?.type === type).length
  }

  /** Positions of the Corruption zone still able to receive a card, as {@link LocationType.CorruptionZone} coordinates. */
  freeCorruptionPositions(player = this.player): { x: number; y: number }[] {
    const zone = this.material(MaterialType.Card).location(LocationType.CorruptionZone).player(player)
    const positions: { x: number; y: number }[] = []
    for (let x = 0; x < CORRUPTION_SLOTS; x++) {
      const filled = zone.filter((item) => item.location.x === x).length
      if (filled < CORRUPTION_SLOT_CAPACITY) positions.push({ x, y: filled })
    }
    return positions
  }

  /** Discard indexes playable this turn, restricted by the one-Mercenary-type-per-turn rule. */
  playableDiscardIndexes(): number[] {
    return this.discard.getIndexes().filter((index) => {
      const data = getCardData(this.material(MaterialType.Card).getItem<SanCard>(index).id)
      if (!data) return false
      return data.type === CardType.Equipment || this.turnFlagsHelper.mercenaryTypePlayable(data.type)
    })
  }

  /** River indexes copyable this turn, restricted by the one-Mercenary-type-per-turn rule. */
  copyableIndexes(): number[] {
    return this.river.getIndexes().filter((index) => {
      const data = getCardData(this.material(MaterialType.Card).getItem<SanCard>(index).id)
      if (!data) return false
      return !isMercenaryType(data.type) || this.turnFlagsHelper.mercenaryTypePlayable(data.type)
    })
  }
}
