import { Corporation } from '@gamepark/san/Corporation'
import { SanBot } from '@gamepark/san/SanBot'
import { MaterialGame, MaterialMove } from '@gamepark/rules-api'

export const ai = (game: MaterialGame, playerId: Corporation): Promise<MaterialMove[]> => {
  return Promise.resolve(new SanBot(playerId).run(game))
}
