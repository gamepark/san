/** Deep copy of a plain-JSON value (card effects are pure data). */
export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
