import { VictoryType } from '@gamepark/san/rules/VictoryType'

/** Translation key suffix for each {@link VictoryType} (rules p.22). */
export const reasonKey: Record<VictoryType, string> = {
  [VictoryType.Corruption]: 'corruption',
  [VictoryType.Propaganda]: 'propaganda',
  [VictoryType.Hacking]: 'hacking',
  [VictoryType.Reserve]: 'reserve'
}
