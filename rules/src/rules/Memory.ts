import { CardType } from '../material/SanCard'

/** The per-player resource counters accumulated this turn, shown on the player panels. */
export interface ResourcesMemory {
  corruption: number
  propaganda: number
  virus: number
  coins: number
  flex: number
}

export const EMPTY_RESOURCES: ResourcesMemory = { corruption: 0, propaganda: 0, virus: 0, coins: 0, flex: 0 }

/**
 * Flags/markers for the current turn. Not derivable from `playArea`'s own cards: {@link
 * import('./actions/CopyRiverRule').CopyRiverRule} can grant `playedMercenaryType` / lift
 * `allTypesAllowed` / flag a card into `singleUseCards` from a *copied* River card's data, without
 * the copying card's own type or effects ever reflecting it.
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
  /**
   * Corruption / Propaganda / Virus / Coins / "any resource" (flex) points accumulated this turn
   * (per player, see {@link ResourcesMemory}). Flex points top up every resource at once for
   * reachability checks, from Equipment "gain any resource" effects, and are spent one at a time to
   * cover a shortfall in whichever resource counter an action draws from.
   */
  Resources = 1,

  /** See {@link TurnFlagsMemory}. */
  TurnFlags,

  /** Queue of {@link import('../material/CardsData').CardEffect} still to resolve for the current card. */
  PendingEffects,
  /** Item index of the card whose effects are being resolved (for "copy" / single-use targeting). */
  ResolvingCardIndex,
  /**
   * Remaining repetitions of the current sub-rule: cards left to draw
   * ({@link import('./RuleId').RuleId.DrawCards}), or effect repeats left (Destroy / Corrupt from
   * hand). These sub-rules are never active at once, so they share one countdown.
   */
  RepeatCount,
  /**
   * Multiplier effects played this turn, each kept up to date with the cards played after it
   * (see {@link import('./ResolveEffectsRule').ResolveEffectsRule.applyMultipliers}).
   */
  Multipliers,

  /**
   * Whether this table was set up with the "first game" option (rules p.10, p.23): hands are refilled
   * to 7 cards instead of 6 for the whole game. Global (no player), set once at
   * {@link import('../SanSetup').SanSetup.setupMaterial} and read by
   * {@link import('./EndTurnRule').EndTurnRule.handSize}.
   */
  FirstGame
}
