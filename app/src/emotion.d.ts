import '@emotion/react'
import { GameTheme } from '@gamepark/react-game'

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Theme extends GameTheme {}
}
