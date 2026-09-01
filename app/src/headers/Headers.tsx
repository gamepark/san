import { RuleId } from '@gamepark/san/rules/RuleId'
import { ComponentType } from 'react'
import { TheFirstStepHeader } from './TheFirstStepHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.TheFirstStep]: TheFirstStepHeader
}
