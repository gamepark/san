/** Shared numeric constants for the board and the turn structure. */

/** Cards making up the River (also the number of steps of a Propaganda track). */
export const RIVER_SIZE = 6

/** Last step of a Propaganda track (banner starts on 0 or on {@link PROPAGANDA_END}). */
export const PROPAGANDA_END = RIVER_SIZE

/** Slots of a Corruption zone, each holding up to {@link CORRUPTION_SLOT_CAPACITY} cards. */
export const CORRUPTION_SLOTS = 6
export const CORRUPTION_SLOT_CAPACITY = 2

/** Corrupted cards needed for a Corruption victory. */
export const CORRUPTION_WIN = 12

/** A Corporation's starting Virus cards; a Hacking victory drives all of the opponent's off. */
export const VIRUS_WIN = 5

/** Spiral points spent to corrupt one card. */
export const CORRUPTION_GROUP = 3

/**
 * Cards a hand is refilled to on a normal table. The "first game" option (rules p.10, p.23) adds 1 for
 * the whole game — see {@link import('../SanOptions').SanOptions.firstGame} and
 * {@link import('../rules/EndTurnRule').EndTurnRule.handSize}.
 */
export const HAND_SIZE = 6

/**
 * Standable "cases d'avancement" printed on a Virus card = 8 − its number (rulebook p.9, diagram
 * p.19). Virus 5 → 3, Virus 4 → 4, Virus 3 → 5, Virus 2 → 6, Virus 1 → 7. Crossing a card off then
 * costs one more Skull than that (the extra step lands the pawn back on the Central Port).
 */
export const virusCardChips = (virusNumber: number): number => 8 - virusNumber

/**
 * `location.id` of a Virus pawn move onto the Central Port (`x: 0`) that drives the opponent's top Virus
 * card off — the pawn leaves that card by its far end, however far away it started. Without it, a move
 * onto the Central Port from the player's own card only retreats there. From the opponent's card, a move
 * onto the Central Port always drives the card off.
 */
export const VIRUS_DRIVE_OFF = 1
