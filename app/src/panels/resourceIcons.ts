import copyCard from '../images/icons/copyCard.png'
import copyRiver from '../images/icons/copyRiver.png'
import corruption from '../images/icons/corruption.png'
import corruptFromHand from '../images/icons/corruptFromHand.png'
import destroy from '../images/icons/destroy.png'
import draw from '../images/icons/draw.png'
import hacking from '../images/icons/hacking.png'
import playFromDiscard from '../images/icons/playFromDiscard.png'
import propagande from '../images/icons/propagande.png'

/** Spiral — Corruption points. Same artwork as the game's own Corruption icon (white on transparent). */
export const corruptionIcon = corruption

/** Arrow — Propaganda / movement points. Same artwork as the game's own Propaganda icon. */
export const propagandaIcon = propagande

/** Skull — Hacking / Virus points. Same artwork as the game's own Hacking icon. */
export const virusIcon = hacking

/**
 * Coin — accumulated revenue. Kept as an inline SVG data URI: no matching game icon was provided for
 * this one (it isn't one of the 3 victory conditions), see below for the others.
 */
const svg = (body: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  )}`

export const coinIcon = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>')

/**
 * Icons for the counters added when card effects became optional/spend-whenever charges (Draw /
 * Destroy / CorruptFromHand / PlayFromDiscard / CopyRiver / CopyPlayed). Game artwork like the 3 above (white on
 * transparent); the opaque originals are kept in `images/icons/base`.
 */
export const drawIcon = draw
export const destroyIcon = destroy
export const corruptFromHandIcon = corruptFromHand
export const playFromDiscardIcon = playFromDiscard
export const copyRiverIcon = copyRiver
export const copyPlayedIcon = copyCard
