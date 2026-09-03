import {
  FillGapStrategy,
  hideItemId,
  hideItemIdToOthers,
  MaterialGame,
  MaterialMove,
  PositiveSequenceStrategy,
  SecretMaterialRules,
  TimeLimit
} from '@gamepark/rules-api'
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
  extends SecretMaterialRules<Corporation, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<Corporation, MaterialType, LocationType>, MaterialMove<Corporation, MaterialType, LocationType>, Corporation>
{
  rules = {
    [RuleId.TheFirstStep]: TheFirstStepRule
  }

  locationsStrategies = {
    [MaterialType.Card]: {
      [LocationType.Deck]: new PositiveSequenceStrategy(),
      [LocationType.Discard]: new PositiveSequenceStrategy(),
      [LocationType.Hand]: new PositiveSequenceStrategy(),
      [LocationType.PlayArea]: new PositiveSequenceStrategy(),
      [LocationType.Reserve]: new PositiveSequenceStrategy(),
      [LocationType.VirusPile]: new PositiveSequenceStrategy(),
      [LocationType.River]: new FillGapStrategy()
    }
  }

  hidingStrategies = {
    [MaterialType.Card]: {
      [LocationType.Deck]: hideItemId,
      [LocationType.Hand]: hideItemIdToOthers
    }
  }

  giveTime(): number {
    return 60
  }
}
