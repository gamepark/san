/**
 * Shared table layout constants for San, in cm (100 px = 1 cm, see MATERIAL.md).
 *
 * The table is a fixed diorama: every board zone keeps a permanent side, `fixedSide(corporation)`
 * giving +1 for Star (bottom half) and -1 for Moon (top half), so switching the viewing player never
 * rearranges the board. Only the private trio — Hand, Deck and Discard — follows the viewer, with
 * `side(relativeIndex)` putting the viewing player at the bottom (+1) and the opponent at the top (-1).
 */

import { Corporation } from '@gamepark/san/Corporation'

export const CARD_WIDTH = 6.3
export const CARD_HEIGHT = 8.8

/** +1 for the viewing player (bottom), -1 for the opponent (top). Used only by the Hand/Deck/Discard. */
export const side = (relativePlayerIndex: number): number => (relativePlayerIndex === 0 ? 1 : -1)

/** Permanent side of a Corporation's board zones: +1 for Star (bottom half), -1 for Moon (top half). */
export const fixedSide = (corporation: Corporation): number => (corporation === Corporation.Star ? 1 : -1)

// --- Shared centre: the River (also the board of the Propaganda track) ---
export const RIVER_Y = 0
export const RIVER_GAP = 9
export const RIVER_SIZE = 6
/** x of River card number i (0..5), centred on the table. */
export const riverX = (i: number): number => (i - (RIVER_SIZE - 1) / 2) * RIVER_GAP

/** The Propaganda track has 7 banner positions (0..6): one before the River, one after each card. */
export const TRACK_STEPS = 7
export const trackX = (step: number): number => (step - (TRACK_STEPS - 1) / 2) * RIVER_GAP

// --- Reserve: left of the River ---
export const RESERVE_X = -34
export const RESERVE_Y = 0

// --- Virus track: far left, laid out vertically around the Central Port ---
export const VIRUS_TRACK_X = 35
export const CENTRAL_PORT_Y = 0
/** y of a Corporation's Virus pile, measured from the Central Port, on its side. */
export const VIRUS_PILE_Y = 7
/** y travelled per step of the Virus pawn along the track. */
export const VIRUS_STEP_Y = 4

// --- Per-player bands (multiplied by side()) ---
export const BANNER_Y = 6.5
export const HAND_BONUS_SPOT_Y = 2
export const CORRUPTION_Y = 15
export const CORRUPTION_SLOT_GAP = 8
export const CORRUPTION_STACK_GAP = 1.4
export const CORRUPTION_SLOTS = 6
export const corruptionSlotX = (slot: number): number => (slot - (CORRUPTION_SLOTS - 1) / 2) * CORRUPTION_SLOT_GAP

export const PLAY_AREA_Y = 26
export const PLAY_AREA_GAP = 7

export const HAND_X = -48
export const HAND_Y = 5
export const HAND_RADIUS = 26

export const DECK_X = -60
export const DECK_Y = 5
export const DISCARD_X = -70
export const DISCARD_Y = 5
export const PLAYER_HAND_BONUS_X = 33
export const PLAYER_HAND_BONUS_Y = 22
export const PLAYER_HAND_BONUS_GAP = 4.6

// --- Box: cards removed from the game, parked off to the side ---
export const BOX_X = 56
export const BOX_Y = 0
