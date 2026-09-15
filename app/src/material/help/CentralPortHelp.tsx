import { useTranslation } from 'react-i18next'

/** Rules p.18 "DÉPLACEMENT SUR LA PISTE VIRUS": the Central Port is the middle of the Virus track. */
export const CentralPortHelp = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2>{t('help.central-port.title')}</h2>
      <p>{t('help.central-port.desc')}</p>
      <p>{t('help.central-port.advance')}</p>
      <p>{t('help.central-port.retreat')}</p>
    </>
  )
}
