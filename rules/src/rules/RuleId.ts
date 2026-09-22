export enum RuleId {
  /**
   * Phase 1 of a turn: play one or more cards and spend, whenever and in whatever order the player
   * wants, everything they produce — resource points, draws, destroys, free corruptions, discard
   * replays, River copies and "either / or" choices alike (see {@link
   * import('./PlayCardsRule').PlayCardsRule}).
   */
  PlayCards = 1,
  /** Phase 2 of a turn (optional): spend the revenue of the played cards to buy River cards. */
  BuyCards,
  /** End of turn: discard played cards, refill the hand, pass to the opponent. */
  EndTurn,
  /** Before the first turn, with the "free" hand size option: each player picks their hand size, then draws it. */
  ChooseHandSize
}
