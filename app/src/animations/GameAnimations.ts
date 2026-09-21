import { LocationType } from '@gamepark/san/material/LocationType'
import { MaterialType } from '@gamepark/san/material/MaterialType'
import { and, isFromLocation, isMaterial, isMyMove, MaterialGameAnimations } from '@gamepark/react-game'

export const gameAnimations = new MaterialGameAnimations()

// Playing one of my own hand cards: the move is already expected, so keep it snappy.
gameAnimations.configure(and(isMaterial(MaterialType.Card), isFromLocation(LocationType.Hand), isMyMove())).duration(200)
