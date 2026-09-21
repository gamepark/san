import { css, useTheme } from '@emotion/react'
import { CardEffect } from '@gamepark/san/material/CardsData'
import { Memory } from '@gamepark/san/rules/Memory'
import { PlayCardsRule } from '@gamepark/san/rules/PlayCardsRule'
import { SanRules } from '@gamepark/san/SanRules'
import { Dialog, GameTheme, PlayMoveButton, ThemeButton, useRules } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { TFunction } from 'i18next'
import { FC, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { effectLabel } from './effectLabel'

type Props = {
  move?: MaterialMove
  auto?: number
  children?: ReactNode
}

/**
 * The "passez" button of the play phase. Anything left unspent is lost at the end of the phase, so
 * when effects can still be applied or chosen, clicking it first lists them in a confirmation dialog.
 * PlayMoveButton's own `confirmation` can't hold a list nor relabel its confirm button, hence this.
 */
export const EndPlayPhaseButton: FC<Props> = ({ move, auto, children }) => {
  const { t } = useTranslation()
  const theme = useTheme() as GameTheme
  const rules = useRules<SanRules>()!
  const [open, setOpen] = useState(false)
  const effects = move ? remainingEffects(new PlayCardsRule(rules.game), t) : []

  if (!effects.length) return <PlayMoveButton move={move} auto={auto}>{children}</PlayMoveButton>

  return (
    <>
      <ThemeButton onClick={() => setOpen(true)}>{children}</ThemeButton>
      <Dialog open={open} onBackdropClick={() => setOpen(false)} css={dialogCss}>
        <div css={[contentCss, theme.dialog.content]}>
          <p>{t('pass.confirm.remaining')}</p>
          <ul>
            {effects.map((effect, index) => (
              <li key={index}>{effect}</li>
            ))}
          </ul>
          <p>{t('pass.confirm.question')}</p>
          <div css={buttonsCss}>
            <ThemeButton onClick={() => setOpen(false)}>{t('pass.confirm.cancel')}</ThemeButton>
            <PlayMoveButton move={move} onPlay={() => setOpen(false)}>
              {t('pass.confirm.ok')}
            </PlayMoveButton>
          </div>
        </div>
      </Dialog>
    </>
  )
}

/** One line per kind of effect still usable this phase — the same checks PlayCardsRule.getPlayerMoves offers moves from. */
const remainingEffects = (rule: PlayCardsRule, t: TFunction): string[] => {
  const effects: string[] = []
  if (rule.corruptionMoves().length) effects.push(t('pass.effect.corruption'))
  if (rule.propagandaMoves().length) effects.push(t('pass.effect.propaganda'))
  if (rule.virusMoves().length) effects.push(t('pass.effect.virus'))
  if (rule.drawMoves().length) effects.push(t('pass.effect.draw', { count: rule.resourcesHelper.points('draw') }))
  if (rule.destroyMoves().length) {
    effects.push(t('pass.effect.destroy', { count: Math.min(rule.resourcesHelper.points('destroy'), rule.hand.length) }))
  }
  if (rule.corruptFromHandMoves().length) effects.push(t('pass.effect.corrupt-from-hand'))
  if (rule.playFromDiscardMoves().length) effects.push(t('pass.effect.play-from-discard'))
  if (rule.copyRiverMoves().length) effects.push(t('pass.effect.copy-river'))
  if (rule.copyPlayedMoves().length) effects.push(t('pass.effect.copy-played'))
  const pending = rule.remind<{ itemIndex: number; options: CardEffect[] }[]>(Memory.PendingEitherChoices) ?? []
  for (const choice of pending) {
    effects.push(t('pass.effect.either', { options: choice.options.map((option) => effectLabel(option, t)).join(` ${t('pass.effect.or')} `) }))
  }
  return effects
}

/** Page, colours and faces come from theme.dialog (the rulebook look): only the layout is set here. */
const dialogCss = css`
  display: flex;
  max-width: 90vw;
  max-height: 90vh;
  padding: 2.5em 3em;
`

const contentCss = css`
  display: flex;
  flex-direction: column;
  font-size: calc(3em * var(--gp-scale));

  ul {
    margin: 0 0 1em;
  }
`

const buttonsCss = css`
  display: flex;
  justify-content: space-between;
  gap: 1em;
`
