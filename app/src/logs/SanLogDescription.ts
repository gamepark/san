import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { LogDescription, MoveComponentContext, MovePlayedLogDescription } from '@gamepark/react-game'
import { isCustomMoveType, isDeleteItemType, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { AdvancePropagandaLog } from './AdvancePropagandaLog'
import { AdvanceVirusLog } from './AdvanceVirusLog'
import { BuyCardLog } from './BuyCardLog'
import { CopyRiverCardLog } from './CopyRiverCardLog'
import { CorruptCardLog } from './CorruptCardLog'
import { CorruptFromHandLog } from './CorruptFromHandLog'
import { DestroyCardLog } from './DestroyCardLog'
import { GainHandBonusLog } from './GainHandBonusLog'
import { NeutralizeVirusLog } from './NeutralizeVirusLog'
import { PlayCardLog } from './PlayCardLog'
import { PlayFromDiscardLog } from './PlayFromDiscardLog'
import { PlayVirusCardLog } from './PlayVirusCardLog'

/**
 * Turns the moves played into the log lines shown in the top-left menu (see the framework's
 * "Moves history" doc). Bookkeeping moves — hand refills, discard reshuffles, River auto-refills,
 * "pass" on a declined optional effect, phase transitions — are deliberately left out: they carry no
 * decision worth reading back.
 */
export class SanLogDescription implements LogDescription {
  getMovePlayedLogDescription(move: MaterialMove, context: MoveComponentContext): MovePlayedLogDescription | undefined {
    const ruleId: RuleId = context.game.rule?.id

    if (isMoveItemType(MaterialType.Card)(move)) {
      // PlayFromDiscard/CorruptFromHand no longer have their own RuleId (folded into PlayCards): the
      // card's location just before this exact move, from the same snapshot `ruleId` above reads, is
      // what tells a River-funded Corruption from a free CorruptFromHand one, and a hand-play from a
      // PlayFromDiscard one — both otherwise identical Card moves landing on the same location.
      const fromType = context.game.items?.[MaterialType.Card]?.[move.itemIndex]?.location.type
      switch (move.location.type) {
        case LocationType.PlayArea:
          if (fromType === LocationType.Discard) return { Component: PlayFromDiscardLog, player: context.action.playerId }
          return { Component: PlayCardLog, player: context.action.playerId }
        case LocationType.Discard:
          if (ruleId === RuleId.BuyCards) return { Component: BuyCardLog, player: context.action.playerId }
          if (ruleId === RuleId.PlayCards) return { Component: PlayVirusCardLog, player: context.action.playerId }
          break
        case LocationType.CorruptionZone:
          if (fromType === LocationType.Hand) return { Component: CorruptFromHandLog, player: context.action.playerId }
          return { Component: CorruptCardLog, player: context.action.playerId }
        case LocationType.Deck:
          // Consequence of the Virus pawn crossing the Central Port (see PlayCardsRule.driveOffTopVirusCard).
          return { Component: NeutralizeVirusLog, player: move.location.player, depth: 1 }
      }
    }

    if (isDeleteItemType(MaterialType.Card)(move)) {
      return { Component: DestroyCardLog, player: context.action.playerId }
    }

    if (isMoveItemType(MaterialType.Banner)(move) && move.location.type === LocationType.PropagandaTrack) {
      return { Component: AdvancePropagandaLog, player: move.location.player }
    }

    if (isMoveItemType(MaterialType.VirusPawn)(move) && move.location.type === LocationType.VirusTrack) {
      return { Component: AdvanceVirusLog, player: context.action.playerId }
    }

    if (isMoveItemType(MaterialType.HandBonusToken)(move) && move.location.type === LocationType.PlayerHandBonus) {
      return { Component: GainHandBonusLog, player: move.location.player, depth: 1 }
    }

    if (isCustomMoveType(CustomMoveType.CopyRiverCard)(move)) {
      return { Component: CopyRiverCardLog, player: context.action.playerId, depth: 1 }
    }

    return undefined
  }
}
