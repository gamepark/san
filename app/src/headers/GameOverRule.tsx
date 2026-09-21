import { css, useTheme } from '@emotion/react'
import { usePlayerName, useRules } from '@gamepark/react-game'
import { Corporation } from '@gamepark/san/Corporation'
import { CORRUPTION_WIN, PROPAGANDA_END } from '@gamepark/san/material/constants'
import {
  conditionLeader,
  corruptedCards,
  propagandaSteps,
  VictoryCondition,
  victoryConditions,
  victoryOutcome,
  virusCardsDrivenOff,
  virusPawnAdvance
} from '@gamepark/san/rules/helper/victory'
import { VictoryType } from '@gamepark/san/rules/VictoryType'
import { SanRules } from '@gamepark/san/SanRules'
import { TFunction } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
import { reasonKey } from './reasonKey'

/**
 * Why the game ended (rules p.22), opened from the "?" at the end of the game-over header
 * (`MaterialHeader.GameOverRule`). When the Reserve ran out, it details the tie-break: each
 * Corporation's progress on the 3 victory conditions, and who leads each one.
 */
export const GameOverRule = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const rules = useRules<SanRules>()!
  const { winner, type } = victoryOutcome(rules)
  const [a, b] = rules.game.players
  const names: Record<Corporation, string> = { [a]: usePlayerName(a), [b]: usePlayerName(b) } as Record<Corporation, string>

  return (
    <div css={dialogCss}>
      <div css={[contentCss, theme.dialog.content]}>
        <h2>{t('help.game-over.title')}</h2>
        {type === VictoryType.Reserve ? (
          <>
            <p>{t('help.game-over.reserve')}</p>
            <table css={tableCss}>
              <thead>
                <tr>
                  <th />
                  <th>{names[a]}</th>
                  <th>{names[b]}</th>
                  <th>{t('help.game-over.leader')}</th>
                </tr>
              </thead>
              <tbody>
                {victoryConditions.map((condition) => {
                  const leader = conditionLeader(rules, condition)
                  return (
                    <tr key={condition}>
                      <th>{t(`help.game-over.condition.${reasonKey[condition]}`)}</th>
                      <td>{progressText(rules, condition, a, t)}</td>
                      <td>{progressText(rules, condition, b, t)}</td>
                      <td>{leader ? names[leader] : t('help.game-over.level')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p>
              {winner ? (
                <Trans i18nKey="help.game-over.reserve.winner" values={{ player: names[winner] }} components={{ b: <strong /> }} />
              ) : (
                t('help.game-over.reserve.tie')
              )}
            </p>
          </>
        ) : (
          <p>
            <Trans i18nKey={`help.game-over.${reasonKey[type]}`} values={{ player: winner ? names[winner] : '' }} components={{ b: <strong /> }} />
          </p>
        )}
      </div>
    </div>
  )
}

const progressText = (rules: SanRules, condition: VictoryCondition, player: Corporation, t: TFunction): string => {
  switch (condition) {
    case VictoryType.Corruption:
      return t('help.game-over.progress.corruption', { count: corruptedCards(rules, player), max: CORRUPTION_WIN })
    case VictoryType.Propaganda:
      return t('help.game-over.progress.propaganda', { count: propagandaSteps(rules, player), max: PROPAGANDA_END })
    case VictoryType.Hacking: {
      const cards = t('help.game-over.progress.hacking', { count: virusCardsDrivenOff(rules, player) })
      const advance = virusPawnAdvance(rules, player)
      return advance ? `${cards} ${t('help.game-over.progress.hacking.pawn', { count: advance })}` : cards
    }
  }
}

/** Same frame as the framework's rules help dialogs (RulesHelpDialogContent): the header's dialog renders children bare. */
const dialogCss = css`
  display: flex;
  padding: 3em;
  max-width: inherit;
  max-height: inherit;
`

const contentCss = css`
  margin: 0 0.5em;
  padding: 0 0.5em;
  font-size: 2.4em;
  overflow: auto;
  flex: 1;
`

const tableCss = css`
  border-collapse: collapse;
  margin: 0.5em 0 1em;

  th,
  td {
    padding: 0.3em 0.8em;
    text-align: left;
    border-bottom: 0.05em solid currentColor;
  }

  thead th {
    font-weight: 700;
  }
`
