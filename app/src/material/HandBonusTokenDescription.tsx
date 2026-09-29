import { Corporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { ItemContext, TokenDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { tutorial } from '../tutorial/Tutorial'
import { HandBonusTokenHelp } from './help/HandBonusTokenHelp'
import moonHandBonus from '../images/tokens/MoonHandBonus.png'
import starHandBonus from '../images/tokens/StarHandBonus.png'
import { tutorialGlowCss } from './tutorialGlow'

/** "Bonus de main" token: grants +1 hand size. 2 per Corporation. Image id = {@link Corporation}. */
class HandBonusTokenDescription extends TokenDescription<number, number, number, Corporation> {
  width = 4.2
  height = 2.7
  borderRadius = 0.3
  transparency = true
  help = HandBonusTokenHelp

  images = {
    [Corporation.Moon]: moonHandBonus,
    [Corporation.Star]: starHandBonus
  }

  /** The player's tokens still on the track glow while the tutorial introduces them (see {@link tutorialGlowCss}). */
  getItemExtraCss(item: MaterialItem, context: ItemContext) {
    const state = context.rules.game.tutorial
    if (
      state &&
      !state.popupClosed &&
      state.step === tutorial.handBonusStep &&
      item.location.type === LocationType.HandBonusSpot &&
      item.location.player === context.player
    )
      return tutorialGlowCss
    return undefined
  }
}

export const handBonusTokenDescription = new HandBonusTokenDescription()
