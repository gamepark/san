import { RuleId } from '@gamepark/san/rules/RuleId'
import { ComponentType } from 'react'
import { BuyCardsHeader } from './BuyCardsHeader'
import { EndTurnHeader } from './EndTurnHeader'
import { PlayCardsHeader } from './PlayCardsHeader'

export const Headers: Record<RuleId, ComponentType> = {
  [RuleId.PlayCards]: PlayCardsHeader,
  [RuleId.BuyCards]: BuyCardsHeader,
  [RuleId.EndTurn]: EndTurnHeader
}
