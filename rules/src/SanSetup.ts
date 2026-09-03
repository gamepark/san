import { MaterialGameSetup } from '@gamepark/rules-api'
import { Corporation } from './Corporation'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { getCardCopies, riverCards, SanCard, startCards, virusCards } from './material/SanCard'

/** Expands a list of card designs into one entry per physical copy (see {@link getCardCopies}). */
const withCopies = (designs: SanCard[]): SanCard[] => designs.flatMap((id) => Array<SanCard>(getCardCopies(id)).fill(id))
import { RuleId } from './rules/RuleId'
import { SanOptions } from './SanOptions'
import { SanRules } from './SanRules'

/** Number of cards making up the River (and steps of the Propaganda track minus one). */
const RIVER_SIZE = 6

/** Cards each Corporation draws for its starting hand (7 for a first game — not handled here). */
const STARTING_HAND = 6

/**
 * This class creates a new Game based on the game options
 */
export class SanSetup extends MaterialGameSetup<Corporation, MaterialType, LocationType, SanOptions> {
  Rules = SanRules

  setupMaterial(_options: SanOptions) {
    this.setupDecks()
    this.setupVirusTracks()
    this.setupRiverAndReserve()
    this.setupPropagandaTracks()

    // DEBUG: fills every remaining LocationType with a few items so all locators can be
    // previewed before any rule exists. Remove this call (and fillAllLocations) once the
    // layout has been checked. See DragonBombSetup.setupDebugPlayerAreas for the same idea.
    //this.fillAllLocations()
  }

  /** Each Corporation shuffles its 12 start cards face down, then draws its opening hand. */
  setupDecks() {
    for (const player of this.players) {
      this.material(MaterialType.Card).createItems(
        withCopies(startCards[player]).map((id) => ({ id, location: { type: LocationType.Deck, player } }))
      )
      this.material(MaterialType.Card).location(LocationType.Deck).player(player).shuffle()
      this.material(MaterialType.Card)
        .location(LocationType.Deck)
        .player(player)
        .deck()
        .deal({ type: LocationType.Hand, player }, STARTING_HAND)
    }
  }

  /** Central Port in the middle, each Corporation's 5 Virus cards stacked (1 bottom → 5 top) on its side, Virus pawn at the centre. */
  setupVirusTracks() {
    this.material(MaterialType.CentralPort).createItem({ id: 1, location: { type: LocationType.CentralPortArea } })
    for (const player of this.players) {
      this.material(MaterialType.Card).createItems(
        virusCards[player].map((id) => ({ id, location: { type: LocationType.VirusPile, player } }))
      )
    }
    this.material(MaterialType.VirusPawn).createItem({ id: 1, location: { type: LocationType.VirusTrack, x: 0 } })
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
   * Each Corporation's banner starts on its own end of the Propaganda track (first player: left,
   * step 0; second player: right, step 6); the 2 Hand Bonus tokens sit further along it.
   */
  setupPropagandaTracks() {
    this.players.forEach((player, index) => {
      const x = index === 0 ? 0 : RIVER_SIZE
      this.material(MaterialType.Banner).createItem({ id: player, location: { type: LocationType.PropagandaTrack, player, x } })
      for (const step of [2, 4]) {
        this.material(MaterialType.HandBonusToken).createItem({ id: player, location: { type: LocationType.HandBonusSpot, player, x: step } })
      }
    })
  }

  /**
   * DEBUG ONLY: adds a few items to every LocationType the real setup leaves empty (Discard,
   * PlayArea, CorruptionZone, PlayerHandBonus, Box), so each locator renders something. Not a
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
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
