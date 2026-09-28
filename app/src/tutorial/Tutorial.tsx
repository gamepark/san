import { css } from '@emotion/react'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isStartRule, Material, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { EffectType, getCardData } from '@gamepark/san/material/CardsData'
import { CORRUPTION_SLOT_CAPACITY, CORRUPTION_SLOTS, HAND_SIZE } from '@gamepark/san/material/constants'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanCard } from '@gamepark/san/material/SanCard'
import { CustomMoveType } from '@gamepark/san/rules/CustomMoveType'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { range } from 'es-toolkit'
import { ReactElement } from 'react'
import { Trans } from 'react-i18next'
import { CardArea } from '../locators/CardAreaLocator'
import { corruptionIcon, propagandaIcon, virusIcon } from '../panels/resourceIcons'
import { colors } from '../theme/colors'
import { CORRUPTED_X, FIRST_CROSSING_X, me, opponent, TutorialSetup } from './TutorialSetup'

type Game = MaterialGame<number, MaterialType, LocationType>
type Move = MaterialMove<number, MaterialType, LocationType>

/** The game's white-on-transparent icons, on a disc of their colour so that they read on the popup's light background. */
const Icon = ({ image, color }: { image: string; color: string }) => <img src={image} alt="" css={iconCss(color)} draggable={false} />

const iconCss = (color: string) => css`
  height: 1.3em;
  width: 1.3em;
  padding: 0.15em;
  box-sizing: border-box;
  border-radius: 50%;
  background: ${color};
  vertical-align: text-bottom;
`

const coloredCss = (color: string) => css`
  color: ${color};
  font-weight: bold;
`

/** Tags available in every `tuto.*` text. */
const components: Record<string, ReactElement> = {
  b: <strong />,
  corruption: <Icon image={corruptionIcon} color={colors.corruption} />,
  propaganda: <Icon image={propagandaIcon} color={colors.propaganda} />,
  hacking: <Icon image={virusIcon} color={colors.hacking} />,
  yellow: <span css={coloredCss(colors.corruptionDark)} />,
  blue: <span css={coloredCss(colors.propaganda)} />,
  red: <span css={coloredCss(colors.hacking)} />,
  grey: <span css={coloredCss(colors.equipment)} />
}

const text = (key: string) => () => <Trans i18nKey={key} components={components} />

/** Index, in the start Equipment cards' "either" effect, of the option giving that resource. */
const equipmentOption = (type: EffectType) => getCardData(SanCard.MoonEquipment)!.effects[0].option!.findIndex((effect) => effect.type === type)

export class Tutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  version = 1
  options = { players: [{ id: me }, { id: opponent }], handSize: HAND_SIZE }
  setup = new TutorialSetup()

  players = [
    { id: me },
    {
      id: opponent,
      name: 'Mathieu',
      avatar: {
        topType: 'ShortHairShortFlat',
        hairColor: 'Black',
        accessoriesType: 'Prescription01',
        facialHairType: 'BeardMedium',
        facialHairColor: 'Black',
        clotheType: 'ShirtCrewNeck',
        clotheColor: 'Gray01',
        eyeType: 'Happy',
        eyebrowType: 'DefaultNatural',
        mouthType: 'Smile',
        skinColor: 'Light'
      }
    }
  ]

  private card(game: Game, move: Move) {
    return isMoveItemType(MaterialType.Card)(move) ? this.material(game, MaterialType.Card).getItem<SanCard>(move.itemIndex) : undefined
  }

  /** Play one of the given cards from hand. */
  private play(...ids: SanCard[]) {
    return (move: Move, game: Game) =>
      isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.PlayArea && ids.includes(this.card(game, move)!.id)
  }

  /** Pick the given resource on the start Equipment card. */
  private choose(type: EffectType) {
    return (move: Move) =>
      isCustomMoveType(CustomMoveType.ChooseEffectOption)(move) && (move.data as { option: number }).option === equipmentOption(type)
  }

  private isBuy(move: Move) {
    return isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Discard
  }

  /** The given area on each of the cards. */
  private cardArea(cards: Material, id: CardArea) {
    return cards.getIndexes().map((parent) => this.location(LocationType.CardArea).id(id).parent(parent).location)
  }

  private hand(game: Game) {
    return this.material(game, MaterialType.Card).location(LocationType.Hand).player(me)
  }

  private playArea(game: Game, player = me) {
    return this.material(game, MaterialType.Card).location(LocationType.PlayArea).player(player)
  }

  private river(game: Game) {
    return this.material(game, MaterialType.Card).location(LocationType.River)
  }

  private riverCard(game: Game, x: number) {
    return this.river(game).location((location) => location.x === x)
  }

  private corrupted(game: Game) {
    return this.material(game, MaterialType.Card).location(LocationType.CorruptionZone).player(me)
  }

  /** Every space of the player's Corruption zone. */
  private corruptionSlots() {
    return range(CORRUPTION_SLOTS).flatMap((x) =>
      range(CORRUPTION_SLOT_CAPACITY).map((y) => this.location(LocationType.CorruptionZone).player(me).x(x).y(y).location)
    )
  }

  private virusTrack(game: Game) {
    return [
      this.material(game, MaterialType.VirusPawn),
      this.material(game, MaterialType.CentralPort),
      this.material(game, MaterialType.Card).location(LocationType.VirusPile)
    ]
  }

  steps: TutorialStep<number, MaterialType, LocationType>[] = [
    { popup: { text: text('tuto.welcome') } },
    { popup: { text: text('tuto.corporations') } },
    {
      popup: { text: text('tuto.hand'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.hand(game)], margin: { top: 10 } })
    },
    {
      popup: { text: text('tuto.play-rule'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.hand(game)], margin: { top: 10 } })
    },
    ...[1, 2, 3].map(
      (): TutorialStep<number, MaterialType, LocationType> => ({
        popup: { text: text('tuto.play-corruption'), position: { y: -20 } },
        focus: (game) => ({
          materials: [this.hand(game).id((id: SanCard) => id === SanCard.MoonCorruption || id === SanCard.MoonEquipment)],
          margin: { top: 10 }
        }),
        move: { filter: this.play(SanCard.MoonCorruption, SanCard.MoonEquipment) }
      })
    ),
    {
      popup: { text: text('tuto.corrupt-symbols'), position: { x: -30 } },
      focus: (game) => ({ materials: [this.playArea(game)], margin: { left: 20 } }),
      move: { filter: this.choose(EffectType.Corruption) }
    },
    {
      popup: { text: text('tuto.river'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.river(game)] })
    },
    {
      popup: { text: text('tuto.corruption-slots'), position: { y: -20 } },
      focus: (game) => ({
        materials: [this.river(game)],
        locations: this.corruptionSlots()
      })
    },
    {
      popup: { text: text('tuto.corrupt-explain'), position: { y: -20 } },
      focus: (game) => ({
        materials: [this.river(game)],
        locations: this.corruptionSlots()
      })
    },
    {
      popup: { text: text('tuto.corrupt-card'), position: { y: -20 } },
      focus: (game) => ({
        materials: [this.riverCard(game, FIRST_CROSSING_X), this.riverCard(game, CORRUPTED_X)],
        locations: [this.location(LocationType.CorruptionZone).player(me).x(FIRST_CROSSING_X).y(0).location],
        // Zoomed out so that the target slot stays in sight, clear of the popup and of the table's edges
        margin: { top: 12, bottom: 4, left: 4, right: 4 }
      }),
      move: {
        filter: (move, game) =>
          isMoveItemType(MaterialType.Card)(move) &&
          move.location.type === LocationType.CorruptionZone &&
          move.location.x === FIRST_CROSSING_X &&
          this.card(game, move)!.location.type === LocationType.River &&
          this.card(game, move)!.location.x === CORRUPTED_X
      }
    },
    {
      popup: { text: text('tuto.corruption-victory'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.corrupted(game), this.river(game)] })
    },
    { move: { filter: isCustomMoveType(CustomMoveType.EndPlayPhase), auto: true } },
    { popup: { text: text('tuto.buy-phase') } },
    {
      popup: { text: text('tuto.revenue'), position: { x: -30 } },
      focus: (game) => ({
        materials: [this.playArea(game)],
        locations: this.cardArea(this.playArea(game), CardArea.Revenue),
        margin: { left: 20 }
      })
    },
    {
      popup: { text: text('tuto.cost'), position: { y: -20 } },
      focus: (game) => ({
        materials: [this.river(game)],
        locations: this.cardArea(this.river(game), CardArea.Cost)
      })
    },
    {
      popup: { text: text('tuto.buy'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.river(game)] }),
      move: { filter: (move) => this.isBuy(move) }
    },
    { move: { filter: isCustomMoveType(CustomMoveType.EndBuyPhase), auto: true, interrupt: (move) => isStartRule(move) && move.id === RuleId.EndTurn } },
    {
      popup: { text: text('tuto.end-turn'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.playArea(game), this.hand(game)] }),
      move: {}
    },
    { popup: { text: text('tuto.opponent-turn') } },
    // One by one: the opponent's random cards may hold a third Hacking card, which must stay in hand.
    ...[SanCard.StarHacking, SanCard.StarHacking, SanCard.StarEquipment].map(
      (card): TutorialStep<number, MaterialType, LocationType> => ({ move: { player: opponent, filter: this.play(card) } })
    ),
    { move: { player: opponent, filter: this.choose(EffectType.Virus) } },
    {
      popup: { text: text('tuto.opponent-hacking'), position: { x: -30 } },
      focus: (game) => ({ materials: [this.playArea(game, opponent)], margin: { left: 20 } })
    },
    {
      popup: { text: text('tuto.virus-track'), position: { x: -30 } },
      focus: (game) => ({ materials: this.virusTrack(game), margin: { left: 20 } })
    },
    {
      move: {
        player: opponent,
        filter: isCustomMoveType(CustomMoveType.DriveOffVirus),
        interrupt: (move) => isMoveItemType(MaterialType.Card)(move) && move.location.type === LocationType.Deck
      }
    },
    {
      popup: { text: text('tuto.virus-card'), position: { x: -30 } },
      focus: (game) => ({ materials: this.virusTrack(game), margin: { left: 20 } }),
      move: {}
    },
    {
      popup: { text: text('tuto.virus-card-deck'), position: { x: 20 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.Card).location(LocationType.Deck).player(me)], margin: { right: 20 } })
    },
    {
      popup: { text: text('tuto.hacking-victory'), position: { x: -30 } },
      focus: (game) => ({ materials: this.virusTrack(game), margin: { left: 20 } })
    },
    { move: { player: opponent, filter: isCustomMoveType(CustomMoveType.EndPlayPhase) } },
    { move: { player: opponent, filter: (move) => this.isBuy(move) } },
    { move: { player: opponent, filter: isCustomMoveType(CustomMoveType.EndBuyPhase) } },
    ...[1, 2, 3].map(
      (): TutorialStep<number, MaterialType, LocationType> => ({
        popup: { text: text('tuto.play-propaganda'), position: { y: -20 } },
        focus: (game) => ({ materials: [this.hand(game).id(SanCard.MoonPropaganda)], margin: { top: 10 } }),
        move: { filter: this.play(SanCard.MoonPropaganda) }
      })
    ),
    {
      popup: { text: text('tuto.propaganda-track'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.river(game), this.material(game, MaterialType.Banner)] })
    },
    {
      popup: { text: text('tuto.crossing-cost'), position: { x: 25 } },
      focus: (game) => ({
        materials: [this.riverCard(game, FIRST_CROSSING_X), this.material(game, MaterialType.Banner).id(me)],
        locations: this.cardArea(this.riverCard(game, FIRST_CROSSING_X), CardArea.CrossingCost),
        margin: { right: 20 }
      })
    },
    {
      popup: { text: text('tuto.crossing-cost-modifiers'), position: { x: 25 } },
      focus: (game) => ({
        materials: [this.riverCard(game, FIRST_CROSSING_X), this.corrupted(game), this.material(game, MaterialType.Banner).id(me)],
        margin: { right: 20 }
      })
    },
    {
      popup: { text: text('tuto.advance-banner'), position: { x: 25 } },
      focus: (game) => ({
        materials: [this.riverCard(game, FIRST_CROSSING_X), this.corrupted(game), this.material(game, MaterialType.Banner).id(me)],
        locations: this.cardArea(this.riverCard(game, FIRST_CROSSING_X), CardArea.CrossingCost),
        margin: { right: 20 }
      }),
      move: { filter: isMoveItemType(MaterialType.Banner) }
    },
    {
      popup: { text: text('tuto.hand-bonus'), position: { y: 20 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.Banner).id(me), this.material(game, MaterialType.HandBonusToken).location(LocationType.HandBonusSpot).player(me)]
      })
    },
    {
      popup: { text: text('tuto.propaganda-victory'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.river(game), this.material(game, MaterialType.Banner)] })
    },
    { popup: { text: text('tuto.free-play') } }
  ]
}
