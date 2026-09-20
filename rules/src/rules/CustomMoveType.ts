export enum CustomMoveType {
  /** End the "play cards" phase and move on to the optional "buy cards" phase. */
  EndPlayPhase = 1,
  /**
   * Pick one side of an "either / or" effect still pending on a played card (see {@link
   * import('./Memory').Memory.PendingEitherChoices}). `data` = `{ itemIndex, option }`: the card
   * that granted the choice, and the index in its `option` array.
   */
  ChooseEffectOption,
  /** Copy a River card, spending a banked {@link import('./Memory').ResourcesMemory.copyRiver} charge. `data` = the item index of the chosen River card. */
  CopyRiverCard,
  /** End the optional "buy cards" phase and move on to the end of turn. */
  EndBuyPhase,
  /** Draw the top card of the deck, spending a banked {@link import('./Memory').ResourcesMemory.draw} charge. */
  DrawCard
}
