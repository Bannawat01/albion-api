// Constants and enums for Albion Online Data API

// Common city names (for convenience)
export const CITIES = {
  CAERLEON: 'Caerleon',
  BRIDGEWATCH: 'Bridgewatch',
  FORT_STERLING: 'Fort Sterling',
  LYMHURST: 'Lymhurst',
  MARTLOCK: 'Martlock',
  THETFORD: 'Thetford',
} as const

// Common location IDs (alternative to city names)
export const LOCATION_IDS = {
  CAERLEON: '301',
  BRIDGEWATCH: '1002',
  FORT_STERLING: '1006',
  LYMHURST: '1012',
  MARTLOCK: '1301',
  THETFORD: '2002',
  // Additional locations from the API documentation 
  LOCATION_4: '4',
  LOCATION_7: '7',
  LOCATION_8: '8',
  LOCATION_2004: '2004',
  LOCATION_2301: '2301',
  LOCATION_3002: '3002',
  LOCATION_3003: '3003',
  LOCATION_3005: '3005',
  LOCATION_3008: '3008',
  LOCATION_3301: '3301',
  LOCATION_4002: '4002',
  LOCATION_4006: '4006',
  LOCATION_4300: '4300',
  LOCATION_4301: '4301',
  LOCATION_5003: '5003',
} as const

// Item quality names for better readability
export const ITEM_QUALITIES = {
  NORMAL: 1,
  GOOD: 2,
  OUTSTANDING: 3,
  EXCELLENT: 4,
  MASTERPIECE: 5,
} as const

// Time scale names for better readability
export const TIME_SCALES = {
  HOURLY: 1,
  SIX_HOUR: 6,
  DAILY: 24,
} as const

// API endpoints structure
export const API_ENDPOINTS = {
  CURRENT_PRICES: '/api/v2/stats/prices',
  HISTORICAL_DATA: '/api/v2/stats/history',
  CHART_DATA: '/api/v2/stats/charts',
  GOLD_PRICES: '/api/v2/stats/gold',
  VIEW_PRICES: '/api/v2/stats/view', // Table view
} as const

// Server base URLs
export const SERVER_URLS = {
  west: 'https://west.albion-online-data.com',
  east: 'https://east.albion-online-data.com',
  europe: 'https://europe.albion-online-data.com',
} as const

// Rate limit information
export const RATE_LIMITS = {
  PER_MINUTE: 180,
  PER_FIVE_MINUTES: 300,
} as const

// URL length limit for API requests
export const URL_LENGTH_LIMIT = 4096
