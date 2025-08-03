export type ItemQuality = 1 | 2 | 3 | 4 | 5
export type ApiDateString = string

export type ISODateString = string
// Item ID format (e.g., "T4_BAG", "T5_SWORD")
export type ItemId = string

// City name or location ID
export type LocationIdentifier = string

// City names as union type
export type CityName =
  | 'Caerleon'
  | 'Bridgewatch'
  | 'Fort Sterling'
  | 'Lymhurst'
  | 'Martlock'
  | 'Thetford'

// Location ID as union type for major cities
export type CityLocationId =
  | '301'   // Caerleon
  | '1002'  // Bridgewatch
  | '1006'  // Fort Sterling
  | '1012'  // Lymhurst
  | '1301'  // Martlock
  | '2002'  // Thetford

