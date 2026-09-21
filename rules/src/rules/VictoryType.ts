/**
 * How a game of San ended (rules p.22). Not memorized: derived from the final board state by
 * {@link import('./helper/victory').victoryOutcome}, so the app can show the right end-of-game message.
 */
export enum VictoryType {
  /** A Corporation corrupted 12 cards. */
  Corruption = 1,
  /** A Corporation's banner reached the far end of its Propaganda track. */
  Propaganda,
  /** A Corporation drove the opponent's last Virus card off. */
  Hacking,
  /** The Reserve ran out: the tie-break rule was applied (a Corporation still wins it, or it's a tie). */
  Reserve
}
