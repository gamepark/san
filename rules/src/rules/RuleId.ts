export enum RuleId {
  /** Phase 1 of a turn: play one or more cards and spend the resources they produce. */
  PlayCards = 1,
  /** Resolve, one by one, the effects of the card currently being played. */
  ResolveEffects,
  /** Pick one side of an "either / or" effect. */
  ChooseEffect,
  /** Draw cards one by one (reshuffling the discard when the deck runs out). */
  DrawCards,
  /** "Destroy a card": send cards from hand to the box. */
  DestroyCard,
  /** "Play a card from your discard". */
  PlayFromDiscard,
  /** "Corrupt a card from your hand". */
  CorruptFromHand,
  /** "Copy a card of the River": adopt its type and effects. */
  CopyRiver,
  /** End of turn: discard played cards, refill the hand, pass to the opponent. */
  EndTurn,
  /** Phase 2 of a turn (optional): spend the revenue of the played cards to buy River cards. */
  BuyCards
}
