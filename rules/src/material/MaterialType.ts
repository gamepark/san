export enum MaterialType {
  /** The 82 cards: start decks, Virus cards and River cards (id = {@link SanCard}) */
  Card = 1,
  /** The 4 "Bonus de main" tokens, 2 per Corporation (id = {@link Corporation}) */
  HandBonusToken,
  /** The 2 Corporation banners moving along the Propaganda track (id = {@link Corporation}) */
  Banner,
  /** The single Virus pawn moving along the Virus track */
  VirusPawn,
  /** The single Central Port tile, sitting at the middle of the Virus track */
  CentralPort
}
