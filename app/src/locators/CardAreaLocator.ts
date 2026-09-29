import { LocationDescription, Locator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { MaterialType } from '@gamepark/san/material/MaterialType'

/** The areas printed on a card that the tutorial points at ({@link import('@gamepark/san/material/LocationType').LocationType.CardArea} `id`). */
export enum CardArea {
  /** Top-right coin: the Revenue earned when playing the card. */
  Revenue = 1,
  /** Bottom-centre coin: the Cost to buy the card from the River. */
  Cost,
  /** Left-edge triangle: the printed crossing cost (the actual one, CrossingCostBadge, is hidden while the tutorial points at it). */
  CrossingCost
}

/** Sizes in cm, measured on the 630×880 artwork (100 px = 1 cm). */
class CardAreaDescription extends LocationDescription {
  getSize(id: CardArea) {
    switch (id) {
      case CardArea.Revenue:
        return { width: 1.3, height: 1.3 }
      case CardArea.Cost:
        return { width: 1.6, height: 1.6 }
      case CardArea.CrossingCost:
        return { width: 1.4, height: 1.4 }
    }
  }

  getBorderRadius(id: CardArea) {
    return id === CardArea.CrossingCost ? 0.3 : 0.8
  }
}

/** Places a {@link CardArea} on its card, only to be focused by the tutorial. */
class CardAreaLocator extends Locator {
  parentItemType = MaterialType.Card
  locationDescription = new CardAreaDescription()

  getPositionOnParent(location: Location) {
    switch (location.id as CardArea) {
      case CardArea.Revenue:
        return { x: 83.7, y: 12 }
      case CardArea.Cost:
        return { x: 50, y: 90.5 }
      case CardArea.CrossingCost:
      default:
        return { x: 11, y: 76 }
    }
  }
}

export const cardAreaLocator = new CardAreaLocator()
