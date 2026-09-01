import { MaterialGameSetup } from '@gamepark/rules-api'
import { Corporation } from './Corporation'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'
import { SanOptions } from './SanOptions'
import { SanRules } from './SanRules'

/**
 * This class creates a new Game based on the game options
 */
export class SanSetup extends MaterialGameSetup<Corporation, MaterialType, LocationType, SanOptions> {
  Rules = SanRules

  setupMaterial(_options: SanOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
