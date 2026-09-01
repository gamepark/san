import { MaterialGame, MaterialMove, MaterialRules, TimeLimit } from '@gamepark/rules-api'
import { Corporation } from './Corporation'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'
import { TheFirstStepRule } from './rules/TheFirstStepRule'

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class SanRules
  extends MaterialRules<Corporation, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<Corporation, MaterialType, LocationType>, MaterialMove<Corporation, MaterialType, LocationType>, Corporation>
{
  rules = {
    [RuleId.TheFirstStep]: TheFirstStepRule
  }

  locationsStrategies = {}

  giveTime(): number {
    return 60
  }
}
