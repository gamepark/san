import { RuleId } from '@gamepark/san/rules/RuleId'
import { ComponentType } from 'react'
import { BuyCardsHeader } from './BuyCardsHeader'
import { ChooseEffectHeader } from './ChooseEffectHeader'
import { CopyRiverHeader } from './CopyRiverHeader'
import { CorruptFromHandHeader } from './CorruptFromHandHeader'
import { DestroyCardHeader } from './DestroyCardHeader'
import { PlayCardsHeader } from './PlayCardsHeader'
import { PlayFromDiscardHeader } from './PlayFromDiscardHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.PlayCards]: PlayCardsHeader,
  [RuleId.BuyCards]: BuyCardsHeader,
  [RuleId.ChooseEffect]: ChooseEffectHeader,
  [RuleId.CopyRiver]: CopyRiverHeader,
  [RuleId.DestroyCard]: DestroyCardHeader,
  [RuleId.PlayFromDiscard]: PlayFromDiscardHeader,
  [RuleId.CorruptFromHand]: CorruptFromHandHeader
}
