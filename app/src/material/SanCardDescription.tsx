import { MaterialType } from '@gamepark/san/material/MaterialType'
import { SanCard } from '@gamepark/san/material/SanCard'
import { RuleId } from '@gamepark/san/rules/RuleId'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { isDeleteItemType, MaterialMove } from '@gamepark/rules-api'
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
  borderRadius = 0.3

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
   * "Destroy a card" effect ({@link RuleId.DestroyCard}): a short click on a hand card sends it to
   * the box (a {@link deleteItem} move emitted by {@link DestroyCardRule}). There is no box drop zone
   * on the table, so the click is the whole interaction. Outside that rule, a click still opens help.
   */
  canShortClick(move: MaterialMove, context: ItemContext) {
    return (
      context.rules.game.rule?.id === RuleId.DestroyCard &&
      isDeleteItemType(MaterialType.Card)(move) &&
      move.itemIndex === context.index
    )
  }
}

export const sanCardDescription = new SanCardDescription()
