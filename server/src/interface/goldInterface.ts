import type { ApiDateString } from "../types/itemBase"

export interface GoldPrice {
    price: number
    timestamp: string
}

export interface GoldPriceOptions {
    date?: ApiDateString
    end_date?: ApiDateString
    count?: number
}