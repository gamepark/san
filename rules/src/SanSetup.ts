import { MaterialGameSetup } from '@gamepark/rules-api'
import { Corporation } from './Corporation'
import { getCardData } from './material/CardsData'
import { HAND_SIZE, PROPAGANDA_END, RIVER_SIZE } from './material/constants'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { getCardCopies, riverCards, SanCard, startCards, virusCards } from './material/SanCard'
import { propagandaDirection, virusDirection } from './rules/helper/directions'
import { Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'
import { SanOptions } from './SanOptions'
import { SanRules } from './SanRules'

/** Expands a list of card designs into one entry per physical copy (see {@link getCardCopies}). */
const withCopies = (designs: SanCard[]): SanCard[] => designs.flatMap((id) => Array<SanCard>(getCardCopies(id)).fill(id))

/**
 * This class creates a new Game based on the game options
 */
export class SanSetup extends MaterialGameSetup<Corporation, MaterialType, LocationType, SanOptions> {
  Rules = SanRules

  /** Computed once the River exists, reused by {@link setupVirusTracks} and {@link start}. */
  private startingPlayer!: Corporation

  setupMaterial(options: SanOptions) {
    // Memorized once for the whole game: EndTurnRule.handSize reads it back at every hand refill.
    const firstGame = this.memorize(Memory.FirstGame, !!options.firstGame)
    this.setupDecks(firstGame)
    this.setupRiverAndReserve()
    this.setupPropagandaTracks()
    // Needs the River in place: it compares the crossing cost of the cards facing each banner.
    this.startingPlayer = this.determineStartingPlayer()
    this.setupVirusTracks()

    // DEBUG: fills every remaining LocationType with a few items so all locators can be
    // previewed before any rule exists. Remove this call (and fillAllLocations) once the
    // layout has been checked. See DragonBombSetup.setupDebugPlayerAreas for the same idea.
    //this.fillAllLocations()
  }

  /**
   * Each Corporation shuffles its 12 start cards face down, then draws its opening hand — 7 cards
   * instead of 6 with the "first game" option (rules p.10).
   */
  setupDecks(firstGame: boolean) {
    const handSize = HAND_SIZE + (firstGame ? 1 : 0)
    for (const player of this.players) {
      this.material(MaterialType.Card).createItems(
        withCopies(startCards[player]).map((id) => ({ id, location: { type: LocationType.Deck, player } }))
      )
      this.material(MaterialType.Card).location(LocationType.Deck).player(player).shuffle()
      this.material(MaterialType.Card)
        .location(LocationType.Deck)
        .player(player)
        .deck()
        .deal({ type: LocationType.Hand, player }, handSize)
    }
  }

  /**
   * Rules p.5, "DÉTERMINER QUI COMMENCE": each Corporation looks at the River card it will cross
   * first (its own end of the shared River — see {@link import('./rules/PlayCardsRule').PlayCardsRule.crossedRiverX}
   * for the same mirroring at play time). Whoever faces the higher crossing cost starts; tied, compare
   * the second card, then the third. Still tied after three cards, the rulebook leaves it to the
   * players ("de la manière de leur choix") — this falls back to `players[0]`, an arbitrary but
   * deterministic choice.
   */
  determineStartingPlayer(): Corporation {
    const river = this.material(MaterialType.Card).location(LocationType.River).getItems<SanCard>()
    const crossingCostAt = (riverX: number) => {
      const card = river.find((item) => item.location.x === riverX)
      return card ? getCardData(card.id)?.crossingCost ?? 0 : 0
    }
    // The k-th (0-indexed) card a Corporation crosses, counting from its own end of the River.
    const facedCost = (player: Corporation, k: number) => {
      const direction = propagandaDirection(this.game, player)
      return crossingCostAt(direction === 1 ? RIVER_SIZE - 1 - k : k)
    }
    const [playerA, playerB] = this.players
    for (let k = 0; k < 3; k++) {
      const costA = facedCost(playerA, k)
      const costB = facedCost(playerB, k)
      if (costA !== costB) return costA > costB ? playerA : playerB
    }
    return this.players[0]
  }

  /**
   * Central Port in the middle, each Corporation's 5 Virus cards stacked (1 bottom → 5 top) on its
   * side. `location.x` is the signed step from the Central Port along the Virus track: the Moon
   * attacks towards the positive side, the Star towards the negative one (see
   * {@link import('./rules/helper/directions').virusDirection}).
   *
   * Rules p.5: the Virus pawn starts not on the Central Port but "sur la première case de la carte
   * Virus 5 de la personne qui commence" — one step onto {@link startingPlayer}'s own Virus 5 card,
   * i.e. on the opposite side from the direction that player attacks.
   */
  setupVirusTracks() {
    this.material(MaterialType.CentralPort).createItem({ id: 1, location: { type: LocationType.CentralPortArea } })
    for (const player of this.players) {
      this.material(MaterialType.Card).createItems(
        virusCards[player].map((id, x) => ({ id, location: { type: LocationType.VirusPile, player, x } }))
      )
    }
    const x = -virusDirection(this.game, this.startingPlayer)
    this.material(MaterialType.VirusPawn).createItem({ id: 1, location: { type: LocationType.VirusTrack, x } })
  }

  /** Shuffle the 48 River cards, reveal 6 as the River, keep the rest face up as the Reserve. */
  setupRiverAndReserve() {
    this.material(MaterialType.Card).createItems(
      withCopies(riverCards).map((id) => ({ id, location: { type: LocationType.Reserve } }))
    )
    this.material(MaterialType.Card).location(LocationType.Reserve).shuffle()
    this.material(MaterialType.Card).location(LocationType.Reserve).deck().deal({ type: LocationType.River }, RIVER_SIZE)
  }

  /**
   * Each Corporation's banner starts on its own end of the Propaganda track — Moon at step 0, Star at
   * {@link PROPAGANDA_END} (see {@link import('./rules/helper/directions').propagandaDirection}) —
   * which is the first step on its left once seated (rules p.4; the app mirrors the track for the
   * player displayed at the bottom, {@link import('../../app/src/locators/SanLayout').riverDirection}),
   * not the seat order; the 2 Hand Bonus tokens sit further along it.
   */
  setupPropagandaTracks() {
    this.players.forEach((player) => {
      const x = player === Corporation.Moon ? 0 : PROPAGANDA_END
      this.material(MaterialType.Banner).createItem({ id: player, location: { type: LocationType.PropagandaTrack, player, x } })
      for (const step of [2, 4]) {
        this.material(MaterialType.HandBonusToken).createItem({ id: player, location: { type: LocationType.HandBonusSpot, player, x: step } })
      }
    })
  }

  /**
   * DEBUG ONLY: adds a few items to every LocationType the real setup leaves empty (Discard,
   * PlayArea, CorruptionZone, PlayerHandBonus), so each locator renders something. Not a
   * legal game state — just a scaffolding to eyeball the table layout.
   */
  fillAllLocations() {
    const filler = riverCards
    for (const player of this.players) {
      this.material(MaterialType.Card).createItems(
        [0, 1, 2].map((i) => ({ id: filler[i], location: { type: LocationType.Discard, player } }))
      )
      this.material(MaterialType.Card).createItems(
        [3, 4].map((i) => ({ id: filler[i], location: { type: LocationType.PlayArea, player } }))
      )
      // Corruption zone: slot 0 full (2 cards), slot 1 with 1 card, slot 3 full
      this.material(MaterialType.Card).createItems([
        { id: filler[5], location: { type: LocationType.CorruptionZone, player, x: 0, y: 0 } },
        { id: filler[6], location: { type: LocationType.CorruptionZone, player, x: 0, y: 1 } },
        { id: filler[7], location: { type: LocationType.CorruptionZone, player, x: 1, y: 0 } },
        { id: filler[8], location: { type: LocationType.CorruptionZone, player, x: 3, y: 0 } },
        { id: filler[9], location: { type: LocationType.CorruptionZone, player, x: 3, y: 1 } }
      ])
      this.material(MaterialType.HandBonusToken).createItem({ id: player, location: { type: LocationType.PlayerHandBonus, player, x: 0 } })
    }
  }

  start() {
    this.startPlayerTurn(RuleId.PlayCards, this.startingPlayer)
  }
}
