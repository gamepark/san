import { Corporation } from '../Corporation'

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
  /**
   * Deal cards from a Corporation's deck to its hand, reshuffling the discard into a new deck as soon
   * as the deck runs out (see {@link import('../SanRules').SanRules}). `data` = {@link DrawData}.
   */
  Draw,
  /** Copy a card played this turn, spending a banked {@link import('./Memory').ResourcesMemory.copyPlayed} charge. `data` = the item index of the chosen played card. */
  CopyPlayedCard,
  /**
   * Drive the opponent's top Virus card off: the pawn crosses every space left up to their last one,
   * then steps onto the Central Port, one space per consequence (see {@link
   * import('./PlayCardsRule').PlayCardsRule.driveOffVirusHops}).
   */
  DriveOffVirus
}

export type DrawData = { player: Corporation; quantity: number }
