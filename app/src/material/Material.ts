import { MaterialType } from '@gamepark/san/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { bannerDescription } from './BannerDescription'
import { centralPortDescription } from './CentralPortDescription'
import { handBonusTokenDescription } from './HandBonusTokenDescription'
import { sanCardDescription } from './SanCardDescription'
import { virusPawnDescription } from './VirusPawnDescription'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.Card]: sanCardDescription,
  [MaterialType.HandBonusToken]: handBonusTokenDescription,
  [MaterialType.Banner]: bannerDescription,
  [MaterialType.VirusPawn]: virusPawnDescription,
  [MaterialType.CentralPort]: centralPortDescription
}
