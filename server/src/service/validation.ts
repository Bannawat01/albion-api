import { BadRequestError } from "../middleware/customError"

/**
 * Input validation helpers for API boundaries.
 * Keeps controllers thin and prevents malformed input from reaching upstream
 * services or being interpolated into external URLs.
 */

// Albion item ids look like "T4_BAG", "T8_MAIN_SWORD@3", "UNIQUE_HIDEOUT".
// Restrict to a safe charset and length to avoid SSRF / path tricks when the
// id is interpolated into external URLs (price + render endpoints).
const ITEM_ID_RE = /^[A-Za-z0-9_@]{1,64}$/

export function isValidItemId(id: unknown): id is string {
    return typeof id === 'string' && ITEM_ID_RE.test(id)
}

export function assertValidItemId(id: unknown): string {
    if (!isValidItemId(id)) {
        throw new BadRequestError("Invalid item id format")
    }
    return id
}

// Canonical Albion markets. Used to reject junk city filters before they reach
// the upstream price API.
export const KNOWN_CITIES = [
    'Brecilien',
    'Caerleon',
    'Thetford',
    'Fort Sterling',
    'Lymhurst',
    'Bridgewatch',
    'Martlock',
    'Black Market',
] as const

const KNOWN_CITY_SET = new Set(KNOWN_CITIES.map(c => c.toLowerCase()))

/**
 * Validate a comma-separated city filter. Returns the cleaned value (or
 * undefined when empty). Throws BadRequestError if any city is unknown.
 */
export function validateCities(city: unknown): string | undefined {
    if (city === undefined || city === null || city === '') return undefined
    if (typeof city !== 'string') {
        throw new BadRequestError("Invalid city filter")
    }
    const parts = city.split(',').map(c => c.trim()).filter(Boolean)
    if (parts.length === 0) return undefined
    const unknown = parts.filter(c => !KNOWN_CITY_SET.has(c.toLowerCase()))
    if (unknown.length) {
        throw new BadRequestError(`Unknown city: ${unknown.join(', ')}`)
    }
    return parts.join(',')
}

// Upper bound on batch size to keep the batch price endpoint bounded.
export const MAX_BATCH_IDS = 100
