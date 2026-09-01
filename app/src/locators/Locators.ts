import { Corporation } from '@gamepark/san/Corporation'
import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { Locator } from '@gamepark/react-game'

export const Locators: Partial<Record<LocationType, Locator<Corporation, MaterialType, LocationType>>> = {}
