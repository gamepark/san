import { Corporation } from '@gamepark/san/Corporation'
import { TokenDescription } from '@gamepark/react-game'
import moonBanner from '../images/pawns/MoonBanner.png'
import starBanner from '../images/pawns/StarBanner.png'

/** The standee banner each Corporation moves along the Propaganda track. Image id = {@link Corporation}. */
class BannerDescription extends TokenDescription<number, number, number, Corporation> {
  width = 2.7
  height = 4.1
  borderRadius = 0.3
  transparency = true

  images = {
    [Corporation.Moon]: moonBanner,
    [Corporation.Star]: starBanner
  }
}

export const bannerDescription = new BannerDescription()
