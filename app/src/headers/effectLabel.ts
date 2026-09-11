import { TFunction } from 'i18next'
import { CardEffect, EffectType } from '@gamepark/san/material/CardsData'

/** Localised label for one side of an "either / or" effect, shown on the choice buttons. */
export const effectLabel = (effect: CardEffect, t: TFunction): string => {
  switch (effect.type) {
    case EffectType.Corruption:
      return t('effect.corruption', { value: effect.value ?? 0 })
    case EffectType.Propaganda:
      return t('effect.propaganda', { value: effect.value ?? 0 })
    case EffectType.Virus:
      return t('effect.virus', { value: effect.value ?? 0 })
    case EffectType.Draw:
      return t('effect.draw', { value: effect.value ?? 1 })
    default:
      return t('effect.any')
  }
}
