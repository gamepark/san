/**
 * Tiny inline icons for the per-turn resource counters shown on the player panels.
 * Kept as data URIs so no extra asset files are needed.
 */
const svg = (body: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  )}`

/** Spiral — Corruption points. */
export const corruptionIcon = svg('<path d="M12 12a3 3 0 1 1 3 3 5 5 0 0 1-5-5 7 7 0 0 1 7-7 9 9 0 0 1 9 9"/>')

/** Arrow — Propaganda / movement points. */
export const propagandaIcon = svg('<path d="M4 12h14"/><path d="M13 6l6 6-6 6"/>')

/** Skull — Hacking / Virus points. */
export const virusIcon = svg(
  '<circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M12 3a8 8 0 0 0-5 14v3h10v-3a8 8 0 0 0-5-14z"/><path d="M10 20v-2M14 20v-2"/>'
)

/** Coin — accumulated revenue. */
export const coinIcon = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>')
