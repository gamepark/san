import { css } from '@emotion/react'
import { ItemButtonProps, ItemMenuButton } from '@gamepark/react-game'
import { HTMLAttributes } from 'react'
import { Trans } from 'react-i18next'

type IconMenuButtonProps = ItemButtonProps &
  HTMLAttributes<HTMLButtonElement> & {
    titleKey: string
    /** Values interpolated in the {@link titleKey} translation. */
    titleValues?: Record<string, unknown>
    /** Keep the label on screen instead of revealing it on hover only. */
    labelAlwaysVisible?: boolean
  }

/**
 * Menu button with a more readable label than the framework's. By default the label is hidden, and only
 * revealed while hovering on devices that can hover (a PC mouse) — never on touch screens.
 */
export const IconMenuButton = ({ titleKey, titleValues, labelAlwaysVisible, ...props }: IconMenuButtonProps) => (
  <ItemMenuButton {...props} css={[labelCss, !labelAlwaysVisible && hoverLabelCss]} label={<Trans i18nKey={titleKey} values={titleValues} />} />
)

/** The label is the button's only `<span>` child (the icon is an `<svg>`). */
const labelCss = css`
  > span {
    /* The framework's rgba(0, 0, 0, 0.5) is hard to read over the card art. */
    background: rgba(0, 0, 0, 0.85);
  }
`

const hoverLabelCss = css`
  > span {
    display: none;
  }

  @media (hover: hover) {
    &:hover > span {
      display: block;
    }
  }
`
