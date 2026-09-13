export enum Corporation {
  Moon = 1,
  Star
}

/** The other Corporation. */
export const otherCorporation = (player: Corporation): Corporation => (player === Corporation.Moon ? Corporation.Star : Corporation.Moon)
