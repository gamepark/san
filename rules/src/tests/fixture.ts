import { MaterialGame, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Corporation } from '../Corporation'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from '../rules/RuleId'
import { SanRules } from '../SanRules'

type Items = Partial<Record<MaterialType, MaterialItem<Corporation, LocationType>[]>>
/** Shape of `game.memory`: `{ [Memory.SomeKey]: value }`, values loose since fixtures build one Memory key at a time. */
type TestMemory = Record<number, unknown>

/**
 * Builds a minimal 2-player game state: only the rule step, items and memory a test actually needs.
 * Real games have far more items (both hands, both decks...); tests only set up what the rule under
 * test reads, exactly like {@link import('../../../../dragon-bomb/rules/src/DragonBombRules.test').game}
 * does in the sibling `dragon-bomb` project.
 */
export function testGame(
  rule: { id: RuleId; player: Corporation },
  items: Items,
  memory: TestMemory = {}
): MaterialGame<Corporation, MaterialType, LocationType, RuleId> {
  return { players: [Corporation.Moon, Corporation.Star], memory, rule, items } as MaterialGame<Corporation, MaterialType, LocationType, RuleId>
}

/** Same as {@link testGame}, already wrapped in a fresh {@link SanRules} instance ready to `.play()`. */
export function testRules(rule: { id: RuleId; player: Corporation }, items: Items, memory: TestMemory = {}): SanRules {
  return new SanRules(testGame(rule, items, memory))
}

/** Play `moves` and all their consequences depth-first, as the server does. */
export function playAll(rules: SanRules, moves: MaterialMove<Corporation, MaterialType, LocationType>[]) {
  const queue = [...moves]
  let move
  while ((move = queue.shift())) queue.unshift(...rules.play(move))
}
