export enum LocationType {
  /** A Corporation's face-down draw pile (starts with its 12 shuffled start cards) */
  Deck = 1,
  /** A Corporation's face-up discard pile */
  Discard,
  /** A Corporation's hand of cards */
  Hand,
  /** Cards a Corporation has played in front of itself this turn, face up */
  PlayArea,
  /** The 6 face-up cards in the middle of the table (also the board of the Propaganda track). location.x = 0..5 */
  River,
  /** The face-up pile of the remaining River cards, used to refill the River */
  Reserve,
  /** A Corporation's Corruption zone: 6 slots (location.x = 0..5), each holding up to 2 face-down cards */
  CorruptionZone,
  /** A Corporation's face-up stack of its 5 Virus cards, on its side of the Central Port (location.x = 0 bottom .. 4 top) */
  VirusPile,
  /** Position of a Corporation's banner on the Propaganda track (location.x = 0..6, one per crossed step) */
  PropagandaTrack,
  /** A "Bonus de main" token still on the Propaganda track, waiting to be collected (location.player = its Corporation, location.x = the step it sits on) */
  HandBonusSpot,
  /** A "Bonus de main" token collected by a Corporation, kept next to its deck (location.x = 0..1) */
  PlayerHandBonus,
  /** Position of the Virus pawn along the Virus track (location.x = signed step, negative on the Moon side, positive on the Star side, 0 = Central Port) */
  VirusTrack,
  /** The Central Port tile location, at the middle of the Virus track */
  CentralPortArea,
}
