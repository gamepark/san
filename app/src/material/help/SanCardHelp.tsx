import { CardEffect, EffectType, getCardData, isVirusCard } from '@gamepark/san/material/CardsData'
import { virusCardChips } from '@gamepark/san/material/constants'
import { CardType, SanCard, virusNumber } from '@gamepark/san/material/SanCard'
import { MaterialHelpProps } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import { SanCardButtons } from './buttons/SanCardButtons'

/** Resource name for a Multiplier effect's `gain` (see EffectType.Multiplier). */
const resourceKeys: Partial<Record<EffectType, string>> = {
  [EffectType.Corruption]: 'resource.corruption',
  [EffectType.Propaganda]: 'resource.propaganda',
  [EffectType.Virus]: 'resource.virus'
}

/**
 * Every text printed on a Mercenary/Equipment card is an icon, never a sentence (rules p.9): this
 * turns each effect into the sentence the rulebook uses to explain that icon (pages 14, 16, 18, 20,
 * 21 and the glossary p.24), so the popup reproduces the rules rather than the (untranslated) icon.
 */
const EffectLine = ({ effect }: { effect: CardEffect }) => {
  const { t } = useTranslation()
  switch (effect.type) {
    case EffectType.Corruption:
      return <>{t('effect.corruption', { value: effect.value ?? 0 })}</>
    case EffectType.Propaganda:
      return <>{t('effect.propaganda', { value: effect.value ?? 0 })}</>
    case EffectType.Virus:
      return <>{t('effect.virus', { value: effect.value ?? 0 })}</>
    case EffectType.Draw:
      return <>{t('effect.draw', { value: effect.value ?? 1 })}</>
    case EffectType.Multiplier:
      return (
        <>
          {t('effect.multiplier', {
            gain: effect.gain !== undefined ? t(resourceKeys[effect.gain]!) : '',
            per: effect.per !== undefined ? t(`card.type.${effect.per}`) : ''
          })}
        </>
      )
    case EffectType.SingleUse:
      return <>{t('effect.single-use')}</>
    case EffectType.CopyPlayed:
      return <>{t('effect.copy-played')}</>
    case EffectType.CopyRiver:
      return <>{t('effect.copy-river')}</>
    case EffectType.Destroy:
      return <>{t('effect.destroy', { value: effect.value ?? 1 })}</>
    case EffectType.AllTypes:
      return <>{t('effect.all-types')}</>
    case EffectType.PlayFromDiscard:
      return <>{t('effect.play-from-discard')}</>
    case EffectType.CorruptFromHand:
      return <>{t('effect.corrupt-from-hand')}</>
    case EffectType.Either:
      return (
        <>
          {t('effect.either')}
          <ul>
            {(effect.option ?? []).map((option, index) => (
              <li key={index}>
                <EffectLine effect={option} />
              </li>
            ))}
          </ul>
        </>
      )
    default:
      return <>{t('effect.any')}</>
  }
}

export const SanCardHelp = (props: MaterialHelpProps) => {
  const { item } = props
  const { t } = useTranslation()
  const id = item.id as SanCard | undefined
  if (id === undefined) return null

  if (isVirusCard(id)) {
    const number = virusNumber(id)
    return (
      <>
        <h2>{t('help.card.virus.title')}</h2>
        <p>{t('help.card.virus.desc')}</p>
        <p>{t('help.card.virus.chips', { value: virusCardChips(number) })}</p>
        <p>{t('help.card.virus.number', { value: number })}</p>
        <SanCardButtons {...props} />
      </>
    )
  }

  const data = getCardData(id)
  if (!data) return null
  return (
    <>
      <h2>{t(`card.type.${data.type}`)}</h2>
      <p>{t(data.type === CardType.Equipment ? 'help.card.equipment' : 'help.card.mercenary')}</p>
      <h3>{t('help.card.effects')}</h3>
      <ul>
        {data.effects.map((effect, index) => (
          <li key={index}>
            <EffectLine effect={effect} />
          </li>
        ))}
      </ul>
      {data.revenue !== undefined && <p>{t('help.card.revenue', { value: data.revenue })}</p>}
      {data.cost !== undefined && <p>{t('help.card.cost', { value: data.cost })}</p>}
      {data.crossingCost !== undefined && <p>{t('help.card.crossing-cost', { value: data.crossingCost })}</p>}
      <SanCardButtons {...props} />
    </>
  )
}
