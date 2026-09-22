import { getEnumValues, OptionsSpecV2 } from '@gamepark/rules-api'
import { Corporation } from './Corporation'
import { HAND_SIZE } from './material/constants'

/**
 * This is the options for each player in the game.
 */
type PlayerOptions = { id: Corporation }

/**
 * This is the type of object that the game receives when a new game is started.
 * The first generic parameter, "{}", can be changed to include game options like variants or expansions.
 */
export type SanOptions = {
  players: PlayerOptions[]
  /**
   * Cards a hand is refilled to for the whole game: 6 (the normal game) or 7 (the "first game" setup,
   * rules p.10, p.23) for both players, or {@link FREE_HAND_SIZE} for each player to pick their own.
   */
  handSize: number
}

/**
 * The `handSize` option value letting each player pick their own hand size before drawing their first
 * hand (asymmetric play, see {@link import('./rules/ChooseHandSizeRule').ChooseHandSizeRule}).
 */
export const FREE_HAND_SIZE = 0

/**
 * The structure of everything a host can choose before the game starts — and nothing else.
 *
 * Two things are deliberately absent, both because they change without the game changing:
 *
 * - **Text.** No labels, no help. They live in `app/public/options/<locale>.json`, published beside the
 *   game's translations and keyed by convention: `option.<option>`, `option.<option>.<value>`,
 *   `identities.<value>`, plus optional `.help` variants. See the files in that folder.
 * - **Subscription and competitive gates.** Which options require a subscription, and which are allowed
 *   in ranked play, are the platform's decisions. They live in its database and are edited there.
 *
 * The declaration is plain JSON on purpose: the platform snapshots it when the bundle is prepared, so
 * every screen reads the option space without downloading and running a game bundle.
 *
 * `players` must match the range declared for the game on the platform — it is the root that every other
 * range narrows, and a disagreement silently changes which tables exist.
 */
export const SanOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 2, max: 2 },
  identities: { values: getEnumValues(Corporation) },
  options: {
    /** 6 (normal game) or 7 cards ("first game", rules p.10, p.23) for both players, or each player's own choice (6 to 8). */
    handSize: { kind: 'enum', values: [HAND_SIZE, HAND_SIZE + 1, FREE_HAND_SIZE] }
  }
}
