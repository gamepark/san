import { css } from '@emotion/react'
import { defaultTheme, GameTheme } from '@gamepark/react-game'
import { colors } from './colors'
import { fontBody, fontDisplay, fontRuleBody, fontRuleTitle } from './typography'

/**
 * Every dialog is laid out like a page of the rulebook (app/public/rules-fr.pdf): a white page with
 * the beige strip that runs down its left margin, and its text set in the rulebook's condensed face.
 */
const dialogContainer = css`
  font-family: ${fontRuleBody};
  border-left: 1.5em solid ${colors.ruleBand};
  border-radius: 0.3em 1em 1em 0.3em;
  box-shadow: 0 0.6em 1.5em rgba(0, 0, 0, 0.55);
`

/**
 * Applied to the text area of every help/rules dialog (the wrapper `description.help` — SanCardHelp,
 * HandBonusTokenHelp, CentralPortHelp — renders into, see MaterialRulesDialogContent.js), and by the
 * game's own dialogs (EndPlayPhaseButton). The rulebook's headings: a section title is white comic
 * capitals on a beige band rounded off at its right end, a sub-title red comic capitals, and a cross
 * reference red too.
 */
const dialogContent = css`
  font-family: ${fontRuleBody};
  color: ${colors.ruleInk};

  h2 {
    font-family: ${fontRuleTitle};
    font-weight: 400;
    color: ${colors.rulePage};
    background: ${colors.ruleBand};
    border-radius: 0 1em 1em 0;
    padding: 0.2em 1em 0.1em 0.5em;
    margin: 0 0 0.6em;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  h3 {
    font-family: ${fontRuleTitle};
    font-weight: 400;
    color: ${colors.ruleRed};
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border-bottom: 0.08em solid ${colors.ruleBandLight};
    padding-bottom: 0.15em;
    margin: 1em 0 0.4em;
  }

  ul {
    padding-left: 1.2em;
  }

  li::marker {
    color: ${colors.ruleRed};
  }

  strong,
  b {
    color: ${colors.ruleRed};
  }
`

/** Buttons inside a dialog: the rulebook's red, lettered in its comic capitals. */
const dialogButtons = css`
  background: ${colors.ruleRed} !important;
  color: ${colors.rulePage} !important;
  border: 0.1em solid ${colors.ruleRedDark} !important;
  border-radius: 1em !important;
  padding: 0.35em 1em 0.25em;
  font-family: ${fontRuleTitle};
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
  box-shadow: 0 0.15em 0.3em rgba(0, 0, 0, 0.25);
  transition:
    background 150ms ease,
    color 150ms ease,
    transform 120ms ease;
  outline: none !important;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.ruleRedDark} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.ruleRed} !important;
    border-color: ${colors.ruleInk} !important;
  }

  &:active:not(:disabled) {
    transform: translateY(0.05em);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

// NB: padding is deliberately not !important — PlayMoveButton's own countdownCss adds an
// un-!important padding-right when its `auto` prop shows a live countdown (see PlayCardsHeader /
// BuyCardsHeader's "Terminer" button); an !important padding here beat that and printed the
// countdown number over the button's own text.
const buttonBase = css`
  background: ${colors.propaganda} !important;
  color: ${colors.paper} !important;
  border: 0.15em solid ${colors.corruptionLight} !important;
  border-radius: 0.3em !important;
  padding: 0.4em 1em;
  font-family: ${fontDisplay};
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow:
    0 0.2em 0.4em rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(247, 247, 245, 0.15);
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    transform 120ms ease;
  outline: none !important;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.propagandaLight} !important;
    border-color: ${colors.corruption} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.propaganda} !important;
    border-color: ${colors.hacking} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.propagandaDark} !important;
    border-color: ${colors.corruptionDark} !important;
    transform: translateY(0.05em);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const headerBar = css`
  background: rgba(28, 28, 30, 0.93);
  border-bottom: 0.15em solid ${colors.corruptionLight};
  color: ${colors.paper};
  font-family: ${fontDisplay};
  box-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.5);

  h1 {
    color: ${colors.paper};
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  b,
  strong {
    color: ${colors.corruptionLight};
  }
`

// NB: padding is deliberately not !important — see buttonBase's note above; this is what "Terminer"'s
// countdown padding-right actually collided with.
const headerButtons = css`
  background: transparent !important;
  color: ${colors.paper} !important;
  border: 0.08em solid rgba(247, 247, 245, 0.5) !important;
  border-radius: 0.3em !important;
  font-family: ${fontDisplay};
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  padding: 0 0.45em;
  box-shadow: none !important;
  outline: none !important;
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.paper} !important;
    color: ${colors.ink} !important;
    border-color: ${colors.paper} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: transparent !important;
    color: ${colors.paper} !important;
    border-color: ${colors.hacking} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.corruptionLight} !important;
    color: ${colors.ink} !important;
    border-color: ${colors.corruptionLight} !important;
  }
`

const menuPanel = css`
  background: ${colors.moon};
  color: ${colors.paper};
  border: 0.05em solid ${colors.moonLight};
  box-shadow:
    0 0 0 0.1em rgba(227, 180, 40, 0.4),
    0 0.6em 1.5em rgba(0, 0, 0, 0.55);
  font-family: ${fontDisplay};

  h2 {
    color: ${colors.paper};
    border-bottom: 0.15em solid ${colors.corruptionLight};
    padding-bottom: 0.3em;
    letter-spacing: 0.02em;
  }
`

const menuMainButton = css`
  background: ${colors.corruptionLight} !important;
  color: ${colors.ink} !important;
  border: 0.15em solid ${colors.corruptionDark} !important;
  outline: none !important;

  &:hover:not(:disabled) {
    background: ${colors.corruptionDark} !important;
    color: ${colors.paper} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.corruptionLight} !important;
    color: ${colors.ink} !important;
  }
`

const playerPanelDataBadge = css`
  background: rgba(0, 0, 0, 0.75) !important;
  color: ${colors.paper} !important;
  border: 0.08em solid ${colors.corruptionLight} !important;
  font-family: ${fontDisplay};
`

export const theme: GameTheme = {
  ...defaultTheme,
  root: {
    ...defaultTheme.root,
    fontFamily: fontBody
  },
  palette: {
    primary: colors.propaganda,
    primaryHover: colors.propagandaLight,
    primaryActive: colors.propagandaDark,
    primaryLight: colors.paper,
    primaryLighter: colors.paperSoft,
    surface: colors.paper,
    onSurface: colors.ink,
    onSurfaceFocus: '#E4E4E1',
    onSurfaceActive: '#D6D6D2',
    danger: colors.hacking,
    dangerHover: colors.hackingLight,
    dangerActive: colors.hackingDark,
    disabled: '#9A9A9A'
  },
  buttons: buttonBase,
  dialog: {
    ...defaultTheme.dialog,
    backgroundColor: colors.rulePage,
    color: colors.ruleInk,
    container: dialogContainer,
    content: dialogContent,
    buttons: dialogButtons
  },
  header: {
    bar: headerBar,
    buttons: headerButtons
  },
  menu: {
    panel: menuPanel,
    mainButton: menuMainButton
  },
  playerPanel: {
    activeRingColors: [colors.corruptionLight, colors.hacking],
    dataBadge: playerPanelDataBadge
  }
}
