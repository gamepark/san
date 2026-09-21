import { css } from '@emotion/react'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons/faDollarSign'
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanCard } from '@gamepark/san/material/SanCard'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { CardDescription, ItemContext, MaterialContentProps } from '@gamepark/react-game'
import { isCustomMoveType, isDeleteItemType, isMoveItemType, MaterialItem, MaterialMove, MaterialMoveBuilder } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { CrossingCostBadge } from './CrossingCostBadge'
import { eitherChoiceButtons } from './EitherChoiceButtons'
import { IconMenuButton } from './IconMenuButton'
import { SanCardHelp } from './help/SanCardHelp'
import { CARD_BORDER_RADIUS } from '../locators/SanLayout'
import { corruptionIcon } from '../panels/resourceIcons'
import { colors } from '../theme/colors'
import back from '../images/cards/CardBack.jpg'
import moonPropaganda from '../images/cards/start/MoonPropaganda.jpg'
import moonHacking from '../images/cards/start/MoonHacking.jpg'
import moonCorruption from '../images/cards/start/MoonCorruption.jpg'
import moonEquipment from '../images/cards/start/MoonEquipment.jpg'
import starPropaganda from '../images/cards/start/StarPropaganda.jpg'
import starHacking from '../images/cards/start/StarHacking.jpg'
import starCorruption from '../images/cards/start/StarCorruption.jpg'
import starEquipment from '../images/cards/start/StarEquipment.jpg'
import moonVirus1 from '../images/cards/virus/MoonVirus1.jpg'
import moonVirus2 from '../images/cards/virus/MoonVirus2.jpg'
import moonVirus3 from '../images/cards/virus/MoonVirus3.jpg'
import moonVirus4 from '../images/cards/virus/MoonVirus4.jpg'
import moonVirus5 from '../images/cards/virus/MoonVirus5.jpg'
import starVirus1 from '../images/cards/virus/StarVirus1.jpg'
import starVirus2 from '../images/cards/virus/StarVirus2.jpg'
import starVirus3 from '../images/cards/virus/StarVirus3.jpg'
import starVirus4 from '../images/cards/virus/StarVirus4.jpg'
import starVirus5 from '../images/cards/virus/StarVirus5.jpg'
import riverPropaganda1 from '../images/cards/river/Propaganda1.jpg'
import riverPropaganda2 from '../images/cards/river/Propaganda2.jpg'
import riverPropaganda3 from '../images/cards/river/Propaganda3.jpg'
import riverPropaganda4 from '../images/cards/river/Propaganda4.jpg'
import riverPropaganda5 from '../images/cards/river/Propaganda5.jpg'
import riverHacking1 from '../images/cards/river/Hacking1.jpg'
import riverHacking2 from '../images/cards/river/Hacking2.jpg'
import riverHacking3 from '../images/cards/river/Hacking3.jpg'
import riverHacking4 from '../images/cards/river/Hacking4.jpg'
import riverHacking5 from '../images/cards/river/Hacking5.jpg'
import riverCorruption1 from '../images/cards/river/Corruption1.jpg'
import riverCorruption2 from '../images/cards/river/Corruption2.jpg'
import riverCorruption3 from '../images/cards/river/Corruption3.jpg'
import riverCorruption4 from '../images/cards/river/Corruption4.jpg'
import riverCorruption5 from '../images/cards/river/Corruption5.jpg'
import riverEquipment1 from '../images/cards/river/Equipment1.jpg'
import riverEquipment2 from '../images/cards/river/Equipment2.jpg'
import riverEquipment3 from '../images/cards/river/Equipment3.jpg'
import riverEquipment4 from '../images/cards/river/Equipment4.jpg'
import riverEquipment5 from '../images/cards/river/Equipment5.jpg'
import riverEquipment6 from '../images/cards/river/Equipment6.jpg'
import riverEquipment7 from '../images/cards/river/Equipment7.jpg'
import riverEquipment8 from '../images/cards/river/Equipment8.jpg'
import riverEquipment9 from '../images/cards/river/Equipment9.jpg'
import riverEquipment10 from '../images/cards/river/Equipment10.jpg'
import riverEquipment11 from '../images/cards/river/Equipment11.jpg'
import riverEquipment12 from '../images/cards/river/Equipment12.jpg'
import riverEquipment13 from '../images/cards/river/Equipment13.jpg'
import riverEquipment14 from '../images/cards/river/Equipment14.jpg'
import riverEquipment15 from '../images/cards/river/Equipment15.jpg'
import riverEquipment16 from '../images/cards/river/Equipment16.jpg'
import riverEquipment17 from '../images/cards/river/Equipment17.jpg'
import riverEquipment18 from '../images/cards/river/Equipment18.jpg'

/**
 * Every San card is a single {@link MaterialType.Card}; the design is chosen by the item id ({@link SanCard}).
 * Cards are 63x88 mm, rendered at 100 px = 1 cm (see MATERIAL.md).
 */
class SanCardDescription extends CardDescription<number, number, number, SanCard> {
  width = 6.3
  height = 8.8
  borderRadius = CARD_BORDER_RADIUS
  help = SanCardHelp

  backImage = back

  images = {
    [SanCard.MoonPropaganda]: moonPropaganda,
    [SanCard.MoonHacking]: moonHacking,
    [SanCard.MoonCorruption]: moonCorruption,
    [SanCard.MoonEquipment]: moonEquipment,
    [SanCard.StarPropaganda]: starPropaganda,
    [SanCard.StarHacking]: starHacking,
    [SanCard.StarCorruption]: starCorruption,
    [SanCard.StarEquipment]: starEquipment,
    [SanCard.MoonVirus1]: moonVirus1,
    [SanCard.MoonVirus2]: moonVirus2,
    [SanCard.MoonVirus3]: moonVirus3,
    [SanCard.MoonVirus4]: moonVirus4,
    [SanCard.MoonVirus5]: moonVirus5,
    [SanCard.StarVirus1]: starVirus1,
    [SanCard.StarVirus2]: starVirus2,
    [SanCard.StarVirus3]: starVirus3,
    [SanCard.StarVirus4]: starVirus4,
    [SanCard.StarVirus5]: starVirus5,
    [SanCard.RiverPropaganda1]: riverPropaganda1,
    [SanCard.RiverPropaganda2]: riverPropaganda2,
    [SanCard.RiverPropaganda3]: riverPropaganda3,
    [SanCard.RiverPropaganda4]: riverPropaganda4,
    [SanCard.RiverPropaganda5]: riverPropaganda5,
    [SanCard.RiverHacking1]: riverHacking1,
    [SanCard.RiverHacking2]: riverHacking2,
    [SanCard.RiverHacking3]: riverHacking3,
    [SanCard.RiverHacking4]: riverHacking4,
    [SanCard.RiverHacking5]: riverHacking5,
    [SanCard.RiverCorruption1]: riverCorruption1,
    [SanCard.RiverCorruption2]: riverCorruption2,
    [SanCard.RiverCorruption3]: riverCorruption3,
    [SanCard.RiverCorruption4]: riverCorruption4,
    [SanCard.RiverCorruption5]: riverCorruption5,
    [SanCard.RiverEquipment1]: riverEquipment1,
    [SanCard.RiverEquipment2]: riverEquipment2,
    [SanCard.RiverEquipment3]: riverEquipment3,
    [SanCard.RiverEquipment4]: riverEquipment4,
    [SanCard.RiverEquipment5]: riverEquipment5,
    [SanCard.RiverEquipment6]: riverEquipment6,
    [SanCard.RiverEquipment7]: riverEquipment7,
    [SanCard.RiverEquipment8]: riverEquipment8,
    [SanCard.RiverEquipment9]: riverEquipment9,
    [SanCard.RiverEquipment10]: riverEquipment10,
    [SanCard.RiverEquipment11]: riverEquipment11,
    [SanCard.RiverEquipment12]: riverEquipment12,
    [SanCard.RiverEquipment13]: riverEquipment13,
    [SanCard.RiverEquipment14]: riverEquipment14,
    [SanCard.RiverEquipment15]: riverEquipment15,
    [SanCard.RiverEquipment16]: riverEquipment16,
    [SanCard.RiverEquipment17]: riverEquipment17,
    [SanCard.RiverEquipment18]: riverEquipment18,
  }

  /**
   * A short click on a card triggers its one obvious move for {@link RuleId.PlayCards}, instead of
   * requiring a drag: corrupting a River card (to CorruptionZone). Hand and discard cards are
   * excluded: a click on a hand card opens its help, one on a discard card opens the discard's help
   * (see {@link displayHelp}), and playing, destroying or replaying one goes through buttons instead. Buying ({@link RuleId.BuyCards}) and copying a River
   * card/drawing (both {@link CustomMoveType}, not tied to a unique target item in the same way) are
   * deliberately not here: they get their own buttons instead — see {@link getItemMenu}. When a card
   * has more than one legal target (e.g. several free CorruptionZone slots), the framework only
   * short-clicks a move that is unique for that card, so this can stay this permissive without
   * picking the target itself. Outside these rules, or when ambiguous, a click still just opens help.
   */
  canShortClick(move: MaterialMove, context: ItemContext) {
    if (context.rules.game.rule?.id !== RuleId.PlayCards) return false
    // A click on a hand card opens its help, as by default: playing or destroying it goes through its menu buttons.
    // A click on a discard card opens the discard's help, where each card can be played.
    const from = context.rules.material(MaterialType.Card).getItem(context.index).location.type
    if (from === LocationType.Hand || from === LocationType.Discard) return false
    if (isDeleteItemType(MaterialType.Card)(move)) return move.itemIndex === context.index
    if (!isMoveItemType(MaterialType.Card)(move) || move.itemIndex !== context.index) return false
    return (
      move.location.type === LocationType.PlayArea ||
      move.location.type === LocationType.Discard ||
      move.location.type === LocationType.CorruptionZone
    )
  }

  /** A discard card opens the help of the whole discard, which lists every card in it (same as skyrift / mythologies). */
  displayHelp(item: MaterialItem, context: ItemContext) {
    if (item.location.type === LocationType.Discard) return MaterialMoveBuilder.displayLocationHelp(item.location)
    return super.displayHelp(item, context)
  }

  // Buttons are always shown (rather than only on hover/selection) so they stay reachable on
  // touch devices, same convention as rival-cities' AllianceCardDescription.
  menuAlwaysVisible = true

  /**
   * "Acheter" on every River card the current buying income can afford ({@link RuleId.BuyCards}),
   * "Copier" on every River card still copyable this turn (spends a banked
   * {@link import('@gamepark/san/rules/Memory').ResourcesMemory.copyRiver} charge) and on every played
   * card still copyable ({@link import('@gamepark/san/rules/Memory').ResourcesMemory.copyPlayed}), "Piocher" on
   * the top of the deck while a banked {@link import('@gamepark/san/rules/Memory').ResourcesMemory.draw}
   * charge remains, and the "either / or" choice buttons on a played card that still has one pending
   * (see {@link eitherChoiceButtons}) — none of these have a natural drag/short-click target of their
   * own, and rendering them here (rather than through `content`) keeps them outside the card's own
   * clickable area, so clicking one doesn't also open the help dialog.
   */
  getItemMenu(item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    if (context.rules.game.rule?.id === RuleId.BuyCards) {
      if (item.location.type !== LocationType.River) return
      const buy = legalMoves.find(
        (move) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === context.index && move.location.type === LocationType.Discard
      )
      if (!buy) return
      // Bottom-right corner of the card (width 6.3 / height 8.8, so half-width 3.15 / half-height 4.4),
      // next to its printed buying cost, inset a bit so it doesn't hang off the edge.
      return (
        <IconMenuButton titleKey="button.buy" css={buyButtonCss} x={2.1} y={3.3} move={buy}>
          <FontAwesomeIcon icon={faDollarSign} />
        </IconMenuButton>
      )
    }

    if (context.rules.game.rule?.id !== RuleId.PlayCards) return

    if (item.location.type === LocationType.River) {
      const copy = legalMoves.find((move) => isCustomMoveType(CustomMoveType.CopyRiverCard)(move) && move.data === context.index)
      const corrupt = this.corruptButton(item, context, legalMoves, 2.3, -5)
      if (!copy && !corrupt) return
      return (
        <>
          {copy && (
            <IconMenuButton titleKey="button.copy-river" labelAlwaysVisible css={copyButtonCss} x={-2.3} y={-5} move={copy}>
              <FontAwesomeIcon icon={faCopy} />
            </IconMenuButton>
          )}
          {corrupt}
        </>
      )
    }

    // Only the active player's own deck: both decks have a card at `x: 0`, so without the player
    // check the "Piocher" button also showed up on the opponent's pile.
    if (item.location.type === LocationType.Deck && item.location.player === context.rules.game.rule?.player && (item.location.x ?? 0) === 0) {
      const draw = legalMoves.find(isCustomMoveType(CustomMoveType.DrawCard))
      if (!draw) return
      return (
        <IconMenuButton titleKey="button.draw" labelAlwaysVisible css={drawButtonCss} x={0} y={0} move={draw}>
          <FontAwesomeIcon icon={faLayerGroup} />
        </IconMenuButton>
      )
    }

    if (item.location.type === LocationType.Hand) {
      const play = legalMoves.find(
        (move) =>
          isMoveItemType(MaterialType.Card)(move) &&
          move.itemIndex === context.index &&
          (move.location.type === LocationType.PlayArea || move.location.type === LocationType.Discard)
      )
      const destroy = legalMoves.find((move) => isDeleteItemType(MaterialType.Card)(move) && move.itemIndex === context.index)
      const corrupt = this.corruptButton(item, context, legalMoves, -2.3, -4.4)
      if (!play && !destroy && !corrupt) return
      // Play and Corrupt straddle the top edge of the card (half-height 4.4); Destroy sits in the
      // top-left corner, just below the printed effect icons.
      return (
        <>
          {play && (
            <IconMenuButton titleKey="button.play" css={playButtonCss} x={0} y={-4.4} move={play}>
              <FontAwesomeIcon icon={faArrowUp} />
            </IconMenuButton>
          )}
          {destroy && (
            <IconMenuButton titleKey="button.destroy" css={destroyButtonCss} x={-1.9} y={-1.6} move={destroy}>
              <FontAwesomeIcon icon={faTrashCan} />
            </IconMenuButton>
          )}
          {corrupt}
        </>
      )
    }

    if (item.location.type === LocationType.Discard) return this.playFromDiscardButton(item, context, legalMoves)

    if (item.location.type === LocationType.PlayArea) {
      const copy = legalMoves.find((move) => isCustomMoveType(CustomMoveType.CopyPlayedCard)(move) && move.data === context.index)
      const choices = eitherChoiceButtons(context, legalMoves)
      if (!copy) return choices
      // Straddles the bottom edge of the card (half-height 4.4), clear of the either / or buttons at the top.
      return (
        <>
          {choices}
          <IconMenuButton titleKey="button.copy-played" labelAlwaysVisible css={copyButtonCss} x={0} y={4.4} move={copy}>
            <FontAwesomeIcon icon={faCopy} />
          </IconMenuButton>
        </>
      )
    }

    return
  }

  /**
   * "Jouer" on the top card of the active player's discard while a banked PlayFromDiscard charge lets
   * them play one of its cards: it opens the discard's help, where the card to play is chosen.
   */
  private playFromDiscardButton(item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]): ReactNode {
    const cards = context.rules.material(MaterialType.Card)
    const discard = cards.location(LocationType.Discard).player(item.location.player)
    if (discard.maxBy((item) => item.location.x ?? 0).getIndex() !== context.index) return
    const canPlay = legalMoves.some(
      (move) =>
        isMoveItemType(MaterialType.Card)(move) &&
        move.location.type === LocationType.PlayArea &&
        cards.getItem(move.itemIndex).location.type === LocationType.Discard &&
        cards.getItem(move.itemIndex).location.player === item.location.player
    )
    if (!canPlay) return
    // Centred on the pile, like "Piocher" on the deck: its edges are crowded by the Virus track buttons.
    return (
      <IconMenuButton
        titleKey="button.play"
        labelAlwaysVisible
        css={playButtonCss}
        x={0}
        y={0}
        move={MaterialMoveBuilder.displayLocationHelp(item.location)}
        options={{ transient: true }}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </IconMenuButton>
    )
  }

  /**
   * "Corrompre" on a River or hand card that can be corrupted: the card has several legal slots, so the
   * button only selects it (a transient, local move, unselecting any other card), and the
   * {@link import('../locators/CorruptionZoneLocator').corruptionZoneLocator} then shows the slots it can
   * go to — a click on one sends it there. A second click on the button cancels the selection.
   */
  private corruptButton(item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[], x: number, y: number): ReactNode {
    const canCorrupt = legalMoves.some(
      (move) => isMoveItemType(MaterialType.Card)(move) && move.itemIndex === context.index && move.location.type === LocationType.CorruptionZone
    )
    if (!canCorrupt) return
    const cards = context.rules.material(MaterialType.Card)
    const moves = item.selected
      ? [cards.index(context.index).unselectItem()]
      : [...cards.selected().unselectItems(), cards.index(context.index).selectItem()]
    return (
      <IconMenuButton
        titleKey="button.corrupt"
        css={[corruptButtonCss, item.selected && selectedCorruptButtonCss]}
        x={x}
        y={y}
        moves={moves}
        options={{ transient: true }}
      >
        <img src={corruptionIcon} alt="" css={iconCss} draggable={false} />
      </IconMenuButton>
    )
  }

  /** Crossing-cost badge, only meaningful (and only rendered) while the card sits in the River. */
  content = (props: MaterialContentProps<SanCard, number>) =>
    this.contentWithBackChildren({
      ...props,
      children: (
        <>
          {props.children}
          <CrossingCostBadge itemIndex={props.itemIndex} />
        </>
      )
    })
}

/** Gold-on-propaganda-blue, matching the table theme (see theme/colors.ts) rather than the library's plain white default. */
const buyButtonCss = css`
  background-color: ${colors.propaganda} !important;
  border: 0.1em solid ${colors.corruptionLight} !important;
  color: ${colors.paper} !important;

  &:hover {
    background-color: ${colors.propagandaLight} !important;
  }
`

/** Equipment grey, distinct from Buy's blue and from the card's own colour. */
const copyButtonCss = css`
  background-color: ${colors.equipment} !important;
  border: 0.1em solid ${colors.paperSoft} !important;
  color: ${colors.paper} !important;

  &:hover {
    background-color: ${colors.equipmentDark} !important;
  }
`

/** Same grey as Copy, centred on the deck rather than in a card corner. */
const drawButtonCss = css`
  background-color: ${colors.equipment} !important;
  border: 0.1em solid ${colors.paperSoft} !important;
  color: ${colors.paper} !important;

  &:hover {
    background-color: ${colors.equipmentDark} !important;
  }
`

/** Same blue as Buy: the card's main action. */
const playButtonCss = buyButtonCss

/** Hacking red, for the irreversible removal of the card. */
const destroyButtonCss = css`
  background-color: ${colors.hacking} !important;
  border: 0.1em solid ${colors.paperSoft} !important;
  color: ${colors.paper} !important;

  &:hover {
    background-color: ${colors.hackingDark} !important;
  }
`

/** Corruption gold, like the Corruption resource. */
const corruptButtonCss = css`
  background-color: ${colors.corruption} !important;
  border: 0.1em solid ${colors.paperSoft} !important;

  &:hover {
    background-color: ${colors.corruptionDark} !important;
  }
`

/** While the card is selected, the button stays pressed: its slots are shown, and a click cancels. */
const selectedCorruptButtonCss = css`
  background-color: ${colors.corruptionDark} !important;
  border-color: ${colors.corruptionLight} !important;
  box-shadow: 0 0 0.3em 0.1em ${colors.corruptionLight};
`

/**
 * The Corruption icon's white artwork reads as is on the gold button. An `<img>`, not a `<span>`: the
 * button's label is styled through `> span` ({@link IconMenuButton}), whose `background` would override it.
 */
const iconCss = css`
  width: 1.1em;
  height: 1.1em;
  object-fit: contain;
  pointer-events: none;
`

export const sanCardDescription = new SanCardDescription()
