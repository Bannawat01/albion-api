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
