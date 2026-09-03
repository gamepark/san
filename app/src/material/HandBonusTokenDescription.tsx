import { Corporation } from '@gamepark/san/Corporation'
import { TokenDescription } from '@gamepark/react-game'
import moonHandBonus from '../images/tokens/MoonHandBonus.png'
import starHandBonus from '../images/tokens/StarHandBonus.png'

/** "Bonus de main" token: grants +1 hand size. 2 per Corporation. Image id = {@link Corporation}. */
class HandBonusTokenDescription extends TokenDescription<number, number, number, Corporation> {
  width = 4.2
  height = 2.7
  borderRadius = 0.3
  transparency = true

  images = {
    [Corporation.Moon]: moonHandBonus,
    [Corporation.Star]: starHandBonus
  }
}

export const handBonusTokenDescription = new HandBonusTokenDescription()
