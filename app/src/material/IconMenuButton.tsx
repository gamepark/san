import { css } from '@emotion/react'
import { ItemButtonProps, ItemMenuButton } from '@gamepark/react-game'
import { HTMLAttributes } from 'react'
import { Trans } from 'react-i18next'

/**
 * Icon-only menu button: the framework label is hidden, and only revealed while hovering on devices that
 * can hover (a PC mouse) — never on touch screens.
 */
export const IconMenuButton = ({ titleKey, ...props }: ItemButtonProps & HTMLAttributes<HTMLButtonElement> & { titleKey: string }) => (
  <ItemMenuButton {...props} css={hoverLabelCss} label={<Trans i18nKey={titleKey} />} />
)

/** The label is the button's only `<span>` child (the icon is an `<svg>`). */
const hoverLabelCss = css`
  > span {
    display: none;
    /* The framework's rgba(0, 0, 0, 0.5) is hard to read over the card art. */
    background: rgba(0, 0, 0, 0.85);
  }

  @media (hover: hover) {
    &:hover > span {
      display: block;
    }
  }
`
