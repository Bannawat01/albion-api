import type { ApiDateString, ISODateString } from "../types/itemBase"

export interface GoldPrice {
    price: number
    timeStamp: ISODateString
}

export interface GoldPriceOptions {
    date?: ApiDateString
    end_date?: ApiDateString
    count?: number
}