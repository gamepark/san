/**
 * Keys of the values kept in the game memory between moves.
 *
 * The four "points" counters are stored **per player** (they are shown on the player panels) and
 * reset at the start of every turn. Everything else concerns the player currently taking their turn.
 */
export enum Memory {
  /** Spiral points accumulated this turn (per player). Spend 3 to corrupt a card. */
  CorruptionPoints = 1,
  /** Movement points accumulated this turn (per player). Spend to advance the banner. */
  PropagandaPoints,
  /** Skull points accumulated this turn (per player). Spend 1 per Virus pawn step. */
  VirusPoints,
  /** Revenue accumulated this turn (per player). Kept for the future "buy" phase. */
  Coins,
  /**
   * "Any resource" points accumulated this turn (per player), from Equipment "gain any resource"
   * effects. They top up every resource at once for reachability checks, and are spent one at a
   * time to cover a shortfall in whichever resource counter an action draws from.
   */
  FlexPoints,

  /** The single Mercenary {@link import('../material/SanCard').CardType} already played this turn, if any. */
  PlayedMercenaryType,
  /** Set by the "play every type you want" effect: lifts the one-Mercenary-type restriction. */
  AllTypesAllowed,
  /** Whether at least one card has been played this turn (the phase cannot end otherwise). */
  CardPlayed,
  /** Item indexes of cards that must be removed from the game (the box), not discarded, at end of turn. */
  SingleUseCards,

  /** Queue of {@link import('../material/CardsData').CardEffect} still to resolve for the current card. */
  PendingEffects,
  /** Item index of the card whose effects are being resolved (for "copy" / single-use targeting). */
  ResolvingCardIndex,
  /** Remaining repetitions of the effect handled by the current sub-rule (Destroy / Corrupt). */
  EffectRepeat,
  /** Remaining cards to draw in {@link import('./RuleId').RuleId.DrawCards}. */
  DrawCount,
  /** Guard so {@link import('./RuleId').RuleId.EndTurn} discards the play area only once. */
  TurnDiscarded,
  /**
   * Multiplier effects played this turn, each kept up to date with the cards played after it
   * (see {@link import('./ResolveEffectsRule').ResolveEffectsRule.applyMultipliers}).
   */
  Multipliers,
  /**
   * Signed step of the Virus pawn as of before its current move, so {@link
   * import('./PlayCardsRule').PlayCardsRule.afterItemMove} can tell an advance that crosses the
   * opponent's card off (arriving on the Central Port from their side) from a plain retreat.
   */
  VirusPawnStep
}
