import { Corporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { Locator } from '@gamepark/react-game'
import { centralPortAreaLocator } from './CentralPortAreaLocator'
import { corruptionZoneLocator } from './CorruptionZoneLocator'
import { playerDeckLocator } from './DeckLocator'
import { discardLocator } from './DiscardLocator'
import { handBonusSpotLocator } from './HandBonusSpotLocator'
import { playerHandLocator } from './HandLocator'
import { playAreaLocator } from './PlayAreaLocator'
import { playerHandBonusLocator } from './PlayerHandBonusLocator'
import { propagandaTrackLocator } from './PropagandaTrackLocator'
import { reserveLocator } from './ReserveLocator'
import { riverLocator } from './RiverLocator'
import { virusPileLocator } from './VirusPileLocator'
import { virusTrackLocator } from './VirusTrackLocator'

export const Locators: Partial<Record<LocationType, Locator<Corporation, MaterialType, LocationType>>> = {
  [LocationType.Deck]: playerDeckLocator,
  [LocationType.Discard]: discardLocator,
  [LocationType.Hand]: playerHandLocator,
  [LocationType.PlayArea]: playAreaLocator,
  [LocationType.River]: riverLocator,
  [LocationType.Reserve]: reserveLocator,
  [LocationType.CorruptionZone]: corruptionZoneLocator,
  [LocationType.VirusPile]: virusPileLocator,
  [LocationType.PropagandaTrack]: propagandaTrackLocator,
  [LocationType.HandBonusSpot]: handBonusSpotLocator,
  [LocationType.PlayerHandBonus]: playerHandBonusLocator,
  [LocationType.VirusTrack]: virusTrackLocator,
  [LocationType.CentralPortArea]: centralPortAreaLocator,
}
