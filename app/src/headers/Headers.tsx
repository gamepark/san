import { RuleId } from '@gamepark/san/rules/RuleId'
import { ComponentType } from 'react'
import { BuyCardsHeader } from './BuyCardsHeader'
import { PlayCardsHeader } from './PlayCardsHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.PlayCards]: PlayCardsHeader,
  [RuleId.BuyCards]: BuyCardsHeader
}
