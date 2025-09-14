import type { ApiDateString } from "../types/itemBase"

 interface GoldPrice {
    price: number
    timestamp: string
}

 interface GoldPriceOptions {
    date?: ApiDateString
    end_date?: ApiDateString
    count?: number
}
export type { GoldPrice, GoldPriceOptions }