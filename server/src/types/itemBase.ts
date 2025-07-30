// Base types and enums for Albion Online Data API

// Server regions available
export type Region = 'americas' | 'asia' | 'europe'

// Quality levels for items (1-5, where 1 is normal, 5 is masterpiece)
export type ItemQuality = 1 | 2 | 3 | 4 | 5

// Time scale options for historical data
export type TimeScale = 1 | 6 | 24 // 1 = hourly, 6 = 6-hour, 24 = daily

// Date format used by the API (MM-DD-YYYY)
export type ApiDateString = string

// ISO date string format
export type ISODateString = string

// Item ID format (e.g., "T4_BAG", "T5_SWORD")
export type ItemId = string

// City name or location ID
export type LocationIdentifier = string

// Item tier levels (T1-T8)
export type ItemTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

// Item enchantment levels (0-4, where 0 is no enchantment)
export type ItemEnchantment = 0 | 1 | 2 | 3 | 4

// Item categories
export type ItemCategory = 
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'consumable'
  | 'resource'
  | 'artifact'
  | 'mount'
  | 'furniture'
  | 'other'

// Market order types
export type OrderType = 'buy' | 'sell'

// API endpoint types
export type ApiEndpoint = 
  | '/api/v2/stats/prices'
  | '/api/v2/stats/history'
  | '/api/v2/stats/charts'
  | '/api/v2/stats/gold'
  | '/api/v2/stats/view'

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

// Quality names as union type
export type QualityName = 
  | 'Normal'
  | 'Good'
  | 'Outstanding'
  | 'Excellent'
  | 'Masterpiece'

// Server URL types
export type ServerUrl = 
  | 'https://west.albion-online-data.com'
  | 'https://east.albion-online-data.com'
  | 'https://europe.albion-online-data.com'

// Price data status
export type PriceDataStatus = 'active' | 'outdated' | 'unavailable'

// Sort order for queries
export type SortOrder = 'asc' | 'desc'

// Common response status
export type ResponseStatus = 'success' | 'error' | 'pending'
