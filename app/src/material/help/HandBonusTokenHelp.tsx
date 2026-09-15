import { useTranslation } from 'react-i18next'

/** Rules p.16 "BONUS DE MAIN". Same text whether the token still sits on the Propaganda track or has already been collected. */
export const HandBonusTokenHelp = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2>{t('help.hand-bonus-token.title')}</h2>
      <p>{t('help.hand-bonus-token.desc')}</p>
      <p>{t('help.hand-bonus-token.effect')}</p>
    </>
  )
}
