export enum RuleId {
  /**
   * Phase 1 of a turn: play one or more cards and spend, whenever and in whatever order the player
   * wants, everything they produce — resource points, draws, destroys, free corruptions, discard
   * replays, River copies and "either / or" choices alike (see {@link
   * import('./PlayCardsRule').PlayCardsRule}).
   */
  PlayCards = 1,
  /** End of turn: discard played cards, refill the hand, pass to the opponent. */
  EndTurn,
  /** Phase 2 of a turn (optional): spend the revenue of the played cards to buy River cards. */
  BuyCards
}
