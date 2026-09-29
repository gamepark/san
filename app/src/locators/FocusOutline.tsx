import { css } from '@emotion/react'
import { useFocusContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { isEqual } from 'es-toolkit'

/**
 * A drop area has nothing to show on the table while it is empty: this `content` only outlines it while the tutorial
 * focuses it, so that the focus has something to point at.
 */
export const focusOutline = (border: string, background: string) => {
  const outlineCss = css`
    position: absolute;
    inset: 0;
    border: 0.1em dashed ${border};
    border-radius: inherit;
    background: ${background};
  `
  return ({ location }: { location: Location }) => {
    const { focus } = useFocusContext()
    if (!focus?.locations?.some((focused) => isEqual(focused, location))) return null
    return <div css={outlineCss} />
  }
}
