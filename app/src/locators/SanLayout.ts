/**
 * Shared table layout constants for San, in cm (100 px = 1 cm, see MATERIAL.md).
 *
 * The River (and the Propaganda track printed along it) stays centred on the table, unrotated, the
 * same for every viewer. Each Corporation's personal area (Deck, Discard, Hand, PlayArea, collected
 * PlayerHandBonus tokens) sits in its own corner below the River — Star's bottom-left, Moon's
 * bottom-right (`cornerSide`) — while its CorruptionZone, Banner and Hand Bonus tokens stay on the
 * shared centre line (`fixedSide`): the CorruptionZone above the River for Moon and below it for
 * Star, each slot in the same column as the River card it corrupts, next to the Banner and Hand
 * Bonus tokens riding the track shared with the opponent.
 */

import { Corporation } from '@gamepark/san/Corporation'
import { RIVER_SIZE } from '@gamepark/san/material/constants'

export const CARD_WIDTH = 6.3
export const CARD_HEIGHT = 8.8

/** Side of the shared centre line a Corporation's track-bound material sits on: +1 for Star (bottom), -1 for Moon (top). */
export const fixedSide = (corporation: Corporation): number => (corporation === Corporation.Star ? 1 : -1)

/** Horizontal side of a Corporation's personal corner, below the River: -1 for Star (bottom-left), +1 for Moon (bottom-right). */
export const cornerSide = (corporation: Corporation): number => (corporation === Corporation.Star ? -1 : 1)

/**
 * Vertical shift applied to the whole shared centre block — River, Reserve, Propaganda track (Banner,
 * HandBonusSpot) and CorruptionZone — moving it up near the top edge of the table, away from the
 * personal corners below (which stay put; their Y values are not relative to this).
 */
export const CENTRE_Y = -20

/**
 * Horizontal shift applied to the whole shared centre block — Reserve, River/Propaganda track and
 * CorruptionZone (which follow the River's columns) — nudging it left, away from the Virus track and
 * personal corners (which stay put; their X values are not relative to this).
 */
export const CENTRE_X = 6

// --- Shared centre: the River (also the board of the Propaganda track) ---
export const RIVER_Y = CENTRE_Y
export const RIVER_GAP = 9
/** x of River card number i (0..5), centred on the table. */
export const riverX = (i: number): number => CENTRE_X + (i - (RIVER_SIZE - 1) / 2) * RIVER_GAP

/**
 * The Propaganda track has 7 banner positions (0..6): one before the River, one after each card.
 * It runs opposite to the River's left-to-right numbering: step 0 is the right end of the table
 * (Moon's home corner, its banner starts top-right) and step 6 the left end (Star's home corner,
 * its banner starts bottom-left). `PropagandaTrackLocator` then pushes each banner to its
 * Corporation's half with `BANNER_Y * fixedSide(player)`.
 */
export const TRACK_STEPS = 7
export const trackX = (step: number): number => CENTRE_X + ((TRACK_STEPS - 1) / 2 - step) * RIVER_GAP

// --- Reserve: left of the River ---
export const RESERVE_X = CENTRE_X - 34
export const RESERVE_Y = CENTRE_Y

// --- Virus track: centred in x, between the two players, laid out horizontally around the Central
// Port (rotated 90°) — Star's pile on the left, Moon's on the right (cornerSide). ---
export const CENTRAL_PORT_X = 0
// Sits between the two players' personal corners, level with PlayArea (y=0) and Deck/Hand (y=18).
export const VIRUS_TRACK_Y = 8
/** x of a Corporation's Virus pile (and of its current top Virus card), measured from the Central Port. */
export const VIRUS_PILE_X = 7

// --- CorruptionZone: each slot in the same column as the River card it corrupts, multiplied by fixedSide() ---
export const CORRUPTION_Y = 11
export const CORRUPTION_STACK_GAP = 1.4

// --- Banner and Hand Bonus tokens: on the shared centre line, multiplied by fixedSide() ---
export const BANNER_Y = 3
export const HAND_BONUS_SPOT_Y = 2

// --- Personal corner (multiplied by cornerSide()): Deck, Discard, Hand, PlayArea, collected
// PlayerHandBonus tokens. Below the River — Star's corner on the left, Moon's on the right.
// Deck/Discard/Hand sit almost against the bottom edge, with PlayArea just above the Deck. ---
export const PLAY_AREA_Y = 0
/** Vertical climb between one played card and the next, in the stack — see {@link import('./PlayAreaLocator')}. */
export const PLAY_AREA_STACK_GAP = 1.8

export const HAND_X = 38
export const HAND_Y = 11
export const HAND_RADIUS = 26

export const DECK_X = 50
export const DECK_Y = 11
export const DISCARD_X = 60
export const DISCARD_Y = 11
export const PLAYER_HAND_BONUS_GAP = 4.6

// --- Box: cards removed from the game, parked off to the side ---
export const BOX_X = 56
export const BOX_Y = 0
