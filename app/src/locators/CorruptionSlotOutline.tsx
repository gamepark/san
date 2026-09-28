import { css } from '@emotion/react'
import { useFocusContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { isEqual } from 'es-toolkit'
import { colors } from '../theme/colors'

/**
 * An empty Corruption slot has nothing to show on the table: it only gets an outline while the tutorial focuses it,
 * so that the focus has something to point at.
 */
export const CorruptionSlotOutline = ({ location }: { location: Location }) => {
  const { focus } = useFocusContext()
  if (!focus?.locations?.some((focused) => isEqual(focused, location))) return null
  return <div css={outlineCss} />
}

const outlineCss = css`
  position: absolute;
  inset: 0;
  border: 0.1em dashed ${colors.corruptionLight};
  border-radius: inherit;
  background: rgba(227, 180, 40, 0.15);
`
