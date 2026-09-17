/**
 * Shared table layout constants for San, in cm (100 px = 1 cm, see MATERIAL.md).
 *
 * The table follows the rulebook set-up (p.6-7): the two Corporations face each other across the
 * River, the player looking at the screen always at the bottom and the opponent at the top.
 *
 * ```
 *   panel / opponent's Deck (180°)   opponent's hand             opponent's Discard (90°) + counters
 *                                    opponent's CorruptionZone   Virus pile
 *   Reserve                          River + Propaganda tracks   Central Port   PlayArea
 *                                    my CorruptionZone           Virus pile
 *   panel / my Deck                  my hand                     my Discard (90°) + counters
 * ```
 *
 * Everything is described once for the near player (y > 0) and reflected across the River for the
 * far one ({@link playerSide}): same left-right order, other side. Nothing is turned upside down but
 * the far player's hand (face down, fanned towards them) and Deck, the far player's corrupted cards (their
 * -1/+1 corners face the River, as the near player's do) and the Virus cards, which face the Central
 * Port as they do on the rulebook diagram. The players never play at the same time, so they share a
 * single PlayArea, on the centre line.
 *
 * The River and the Propaganda track read from the near player's point of view: each Corporation's
 * banner starts on the first step on its left (rules p.4), so the track — and the River columns it
 * runs along — is mirrored left to right when the viewer is Moon ({@link riverDirection}).
 */

import { getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Corporation } from '@gamepark/san/Corporation'
import { RIVER_SIZE } from '@gamepark/san/material/constants'

export const CARD_WIDTH = 6.3
export const CARD_HEIGHT = 8.8

/** The Corporation displayed at the bottom: the player's own, or the first one for a spectator. */
export const bottomCorporation = (context: MaterialContext): Corporation => context.player ?? context.rules.players[0]

/** True for the Corporation displayed at the bottom of the table. */
export const isNear = (corporation: Corporation, context: MaterialContext): boolean => getRelativePlayerIndex(context, corporation) === 0

/** Side of the River a Corporation's material sits on: +1 at the bottom (near), -1 at the top (far). */
export const playerSide = (corporation: Corporation, context: MaterialContext): number => (isNear(corporation, context) ? 1 : -1)

/**
 * Left-right orientation of the River and of the Propaganda track. The rules number the track from
 * Moon's start (step 0) to Star's ({@link import('@gamepark/san/material/constants').PROPAGANDA_END}),
 * and both start on their own left: step 0 is on the right when Star is at the bottom, on the left
 * when Moon is.
 */
export const riverDirection = (context: MaterialContext): number => (bottomCorporation(context) === Corporation.Moon ? -1 : 1)

// --- Centre: the River (also the board of the two Propaganda tracks) ---
export const RIVER_GAP = 9
/** x of River card number i (0..5). */
export const riverX = (i: number, context: MaterialContext): number => riverDirection(context) * (i - (RIVER_SIZE - 1) / 2) * RIVER_GAP

/** The Propaganda track has 7 steps (0..6): one before the River, one after each card, between the cards. */
export const TRACK_STEPS = 7
export const trackX = (step: number, context: MaterialContext): number => riverDirection(context) * ((TRACK_STEPS - 1) / 2 - step) * RIVER_GAP

/** Banner and Hand Bonus tokens ride their own Corporation's track, across the River cards on its side. */
export const BANNER_Y = 3
/** The near player's banner sits 1 cm closer to the River than the far player's. */
export const NEAR_BANNER_Y = BANNER_Y - 1
export const HAND_BONUS_SPOT_Y = 2

// --- Left column: the Reserve, between the two players' Decks ---
/**
 * Just short of the banners on the last step of the track (-27): their drawing is 1.8 cm wide, the
 * rest of the 2.7 cm image is its baked shadow.
 */
export const RESERVE_X = -27 - 0.9 - 0.3 - CARD_WIDTH / 2
export const RESERVE_Y = 0

// --- Virus track: right of the River, the Central Port in the middle, one Virus pile on each side ---
export const VIRUS_TRACK_X = 33
/**
 * The card at the base of a Virus pile sits in the Central Port's notch: the notch floor is 1.13 cm
 * from the tile's centre (measured on the tile's image), and between its two ears the card's bottom
 * edge rests on it.
 */
export const VIRUS_PILE_Y = 1.13 + CARD_HEIGHT / 2

// --- CorruptionZone: one slot under each River card, 2 cards stacked towards the player's edge ---
/** Nearly touching the River card. */
export const CORRUPTION_Y = CARD_HEIGHT + 0.3
/** Leaves the whole -1/+1 strip printed along the top of the first card's back in sight (1.6 cm). */
export const CORRUPTION_STACK_GAP = 1.9

// --- PlayArea: shared, right of the Central Port, the first card level with the player's Virus pile ---
/**
 * Centred on the column of resource counters, right of the Discard: they start 0.4 cm past its edge
 * and are 7.06 cm wide (measured with one digit each). That leaves about 1 cm between the cards and the Central Port tile.
 */
export const PLAY_AREA_X = VIRUS_TRACK_X + CARD_HEIGHT / 2 + 0.4 + 7.06 / 2
/** Vertical step between one played card and the next: the top strip of each card stays in sight. */
export const PLAY_AREA_STACK_GAP = 1.8
/**
 * Cards spread at the full step; past that the stack closes ranks. 11 cards span 18 cm, which takes
 * the stack from one Virus pile to 0.8 cm short of the far edge of the table.
 */
export const PLAY_AREA_MAX_COUNT = 11
/** Height of the drop zone: about the two Virus piles and the Central Port between them. */
export const PLAY_AREA_DROP_HEIGHT = 20

// --- A player's own area, along their edge of the table ---
/** The Discard lies on its side (90°), just past its owner's Virus pile. */
export const DISCARD_X = VIRUS_TRACK_X
export const DISCARD_Y = VIRUS_PILE_Y + CARD_HEIGHT / 2 + 0.5 + CARD_WIDTH / 2

/**
 * The hand covers most of the Corruption slots: only the top of a corrupted card matters, where its
 * -1/+1 corners are printed, so the hand starts just below that strip on the second card of a slot.
 * It is drawn above them.
 */
export const HAND_Y = CORRUPTION_Y + CORRUPTION_STACK_GAP + 1.7
export const HAND_Z = 0.5
/**
 * A wide, nearly flat fan where each card covers only the white border of the previous one (0.5 cm),
 * leaving its top-right number (which ends 0.6 cm from the edge) in sight.
 */
export const HAND_RADIUS = 500
export const HAND_GAP_ANGLE = (5.8 / HAND_RADIUS) * (180 / Math.PI)
/**
 * Up to 9 cards spread that way; past it they close ranks within the same width. Fanned 9 cards reach
 * 26.55 cm either side of the centre: {@link PLAYER_PANEL_WIDTH} is what leaves them that room.
 */
export const HAND_MAX_ANGLE = HAND_GAP_ANGLE * 8

/** Under the Reserve, the collected Hand Bonus tokens between the two. The player panel covers its lower part. */
export const DECK_X = RESERVE_X
export const DECK_Y = 11.5

/** Collected Hand Bonus tokens: side by side, upright, just above the Deck (3 x 1.5 cm without their shadow). */
export const PLAYER_HAND_BONUS_X = DECK_X
export const PLAYER_HAND_BONUS_Y = DECK_Y - CARD_HEIGHT / 2 - 1
export const PLAYER_HAND_BONUS_GAP = 3.2

// --- Table bounds ---
/** The Reserve pile's left edge, shifted by its 20 displayed cards (-0.05 cm each), with a small margin. */
export const TABLE_X_MIN = RESERVE_X - CARD_WIDTH / 2 - 19 * 0.05 - 0.3
/** The resource counters, right of the Discard, end at 44.9 with one digit each: room is left for a second one. */
export const TABLE_X_MAX = 45.6
/** The fanned hand's outer cards drop a little below its centre line. */
export const TABLE_HALF_HEIGHT = 17.7

// --- Player panels: laid on the table, in its left corners, over the lower part of the Deck ---
/** StyledPlayerPanel draws itself 28 em wide: giving it a width in cm sets the size of everything in it. */
export const PLAYER_PANEL_EM_WIDTH = 28
/** As wide as a hand of 9 cards allows, between the panel and the Discard. */
export const PLAYER_PANEL_WIDTH = 10.2
export const PLAYER_PANEL_X = TABLE_X_MIN + 0.3
/** Where the near panel's bottom edge (the far panel's top edge) lies. */
export const PLAYER_PANEL_Y = TABLE_HALF_HEIGHT - 0.3
/** Over every piece of material. */
export const PLAYER_PANEL_Z = 2

/** x of the hand's centre: halfway between the panel's right edge and the left edge of the Discard lying on its side. */
export const HAND_X = (PLAYER_PANEL_X + PLAYER_PANEL_WIDTH + DISCARD_X - CARD_HEIGHT / 2) / 2
