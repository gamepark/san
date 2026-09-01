import { MaterialGameSetup } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'
import { SanOptions } from './SanOptions'
import { SanRules } from './SanRules'

/**
 * This class creates a new Game based on the game options
 */
export class SanSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, SanOptions> {
  Rules = SanRules

  setupMaterial(_options: SanOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
