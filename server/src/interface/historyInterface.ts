import type { ApiDateString, ISODateString, ItemId, ItemQuality, LocationIdentifier, TimeScale } from "../types/itemBase"

export interface HistoricalDataPoint {
    timestamp: ISODateString
    avg_price: number
    item_count: number
}

// Historical data response
export interface HistoricalData {
    item_id: ItemId
    city: LocationIdentifier
    quality: ItemQuality
    data: HistoricalDataPoint[]
}

// Chart data response (similar to historical but formatted for charts)
export interface ChartData {
    item_id: ItemId
    city: LocationIdentifier
    quality: ItemQuality
    data: HistoricalDataPoint[]
}

// API request options for historical data
export interface HistoricalDataOptions {
    date?: ApiDateString // Start date in format: "MM-DD-YYYY" (e.g., "2-5-2020")
    end_date?: ApiDateString // End date in format: "MM-DD-YYYY"
    locations?: LocationIdentifier[]
    qualities?: ItemQuality[]
    'time-scale'?: TimeScale // Note: API uses 'time-scale' with hyphen
}


export interface HistoricalDataResponse {
    item_id: string
    city: string
    quality: number
    data: HistoricalDataPoint[]
}


