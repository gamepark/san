import { css } from '@emotion/react'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanRules } from '@gamepark/san/SanRules'
import { LocationHelpProps, MaterialComponent, PlayMoveButton, pointerCursorCss, useLegalMoves, usePlay, usePlayerName, useRules } from '@gamepark/react-game'
import { isMoveItemType, MaterialMoveBuilder, MoveItem } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import displayMaterialHelp = MaterialMoveBuilder.displayMaterialHelp

/**
 * Every card of a Corporation's discard, top card first (same convention as skyrift / mythologies'
 * PlayerDiscardHelp). A click on a card opens its own help; while a PlayFromDiscard charge is banked,
 * each eligible card also gets a button to play it.
 */
export const DiscardHelp = ({ location, closeDialog }: LocationHelpProps) => {
  const { t } = useTranslation()
  const player = usePlayerName(location.player)
  const rules = useRules<SanRules>()!
  const play = usePlay()
  const cards = rules.material(MaterialType.Card).location(LocationType.Discard).player(location.player).sort((item) => -(item.location.x ?? 0))
  const playMoves = useLegalMoves<MoveItem>(
    (move) =>
      isMoveItemType(MaterialType.Card)(move) &&
      move.location.type === LocationType.PlayArea &&
      rules.material(MaterialType.Card).getItem(move.itemIndex).location.type === LocationType.Discard
  )

  return (
    <>
      <h2>{t('help.discard.title', { player })}</h2>
      <p>{cards.length ? t('help.discard.count', { count: cards.length }) : t('help.discard.empty')}</p>
      <ol css={gridCss}>
        {cards.entries.map(([index, card]) => {
          const move = playMoves.find((move) => move.itemIndex === index)
          return (
            <li key={index} css={cellCss}>
              <MaterialComponent
                type={MaterialType.Card}
                itemId={card.id}
                css={[pointerCursorCss, itemCss]}
                onClick={() => play(displayMaterialHelp(MaterialType.Card, card, index), { transient: true })}
              />
              {move && (
                <PlayMoveButton move={move} onPlay={closeDialog}>
                  {t('help.button.play')}
                </PlayMoveButton>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}

const gridCss = css`
  display: grid;
  grid-template-columns: repeat(5, auto);
  list-style-type: none;
  gap: 1em;
  padding: 0 0.5em 0.5em 0;
  margin: 0;
`

const cellCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
`

const itemCss = css`
  font-size: 1.5em;
`
