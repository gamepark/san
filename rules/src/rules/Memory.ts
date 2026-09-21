import { CardType } from '../material/SanCard'

/**
 * The per-player resource counters accumulated this turn, shown on the player panels. Every
 * counter here is credited immediately when a card is played, and spent at the player's own
 * pace during the rest of {@link import('./RuleId').RuleId.PlayCards} — never forced the moment
 * the card is played.
 */
export interface ResourcesMemory {
  corruption: number
  propaganda: number
  virus: number
  coins: number
  /** Cards still drawable from the deck this turn (one {@link import('./CustomMoveType').CustomMoveType.Draw} of the play phase spends one). */
  draw: number
  /** Hand cards still destroyable (to the box) this turn. */
  destroy: number
  /** Hand cards still corruptible for free (no group-of-3 cost) this turn. */
  corruptFromHand: number
  /** Discard cards still playable this turn. */
  playFromDiscard: number
  /** River cards still copyable this turn. */
  copyRiver: number
  /** Cards played this turn still copyable. */
  copyPlayed: number
}

export const EMPTY_RESOURCES: ResourcesMemory = {
  corruption: 0,
  propaganda: 0,
  virus: 0,
  coins: 0,
  draw: 0,
  destroy: 0,
  corruptFromHand: 0,
  playFromDiscard: 0,
  copyRiver: 0,
  copyPlayed: 0
}

/**
 * Flags/markers for the current turn. Not derivable from `playArea`'s own cards: spending a
 * {@link ResourcesMemory.copyRiver} or {@link ResourcesMemory.copyPlayed} charge (see
 * {@link import('./PlayCardsRule').PlayCardsRule}) can grant `playedMercenaryType` / lift `allTypesAllowed` / flag a card into `singleUseCards`
 * from a *copied* River card's data, without the copying card's own type or effects ever
 * reflecting it.
 */
export interface TurnFlagsMemory {
  /** The single Mercenary type already played (or copied) this turn, if any. */
  playedMercenaryType?: CardType
  /** Set by the "play every type you want" effect: lifts the one-Mercenary-type restriction. */
  allTypesAllowed: boolean
  /**
   * Whether at least one card has been played this turn (the phase cannot end otherwise). Not
   * derivable from `playArea.length`: a Virus card played from hand skips the play area and goes
   * straight to `Discard`, which is never emptied between turns.
   */
  cardPlayed: boolean
  /** Item indexes of cards that must be removed from the game (the box), not discarded, at end of turn. */
  singleUseCards: number[]
}

export const EMPTY_TURN_FLAGS: TurnFlagsMemory = { allTypesAllowed: false, cardPlayed: false, singleUseCards: [] }

/**
 * Keys of the values kept in the game memory between moves.
 *
 * {@link Memory.Resources} is stored **per player** (shown on the player panels) and reset at the
 * start of every turn. Everything else concerns the player currently taking their turn.
 */
export enum Memory {
  /** Corruption / Propaganda / Virus / Coins and the other per-turn charges (per player, see {@link ResourcesMemory}). */
  Resources = 1,

  /** See {@link TurnFlagsMemory}. */
  TurnFlags,

  /**
   * Pending "either / or" choices, one entry per played card whose {@link
   * import('../material/CardsData').EffectType.Either} effect hasn't been resolved yet: `{
   * itemIndex, options }`. Unlike the pooled counters in {@link ResourcesMemory}, these can't be
   * merged across cards (each carries its own distinct set of options), so they stay keyed by the
   * card that granted them. Shown as one button per option directly on that card.
   */
  PendingEitherChoices,
  /**
   * One copy chain per unspent {@link ResourcesMemory.copyRiver} charge, oldest first (FIFO). A chain
   * lists item indexes: first the played card holding the charge, then every card copied along the
   * way to grant it — none of them can be copied by this charge. Spending a charge `shift()`s this
   * list: if the copied card turns out to be Single Use, the chain's first card is the one flagged
   * into `singleUseCards` instead of the copied card itself.
   */
  CopyRiverSources,
  /**
   * Multiplier effects played this turn, each kept up to date with the cards played after it
   * (see {@link import('./PlayCardsRule').PlayCardsRule.applyMultipliers}).
   */
  Multipliers,

  /**
   * Whether this table was set up with the "first game" option (rules p.10, p.23): hands are refilled
   * to 7 cards instead of 6 for the whole game. Global (no player), set once at
   * {@link import('../SanSetup').SanSetup.setupMaterial} and read by
   * {@link import('./EndTurnRule').EndTurnRule.handSize}.
   */
  FirstGame,

  /** Same as {@link Memory.CopyRiverSources}, for the {@link ResourcesMemory.copyPlayed} charges. */
  CopyPlayedSources
}
