import type { ISODateString, ItemId, ItemQuality, LocationIdentifier } from "../types/itemBase"


export interface Price {
    itemName: any
    item_id: ItemId
    city: LocationIdentifier
    quantity: ItemQuality

    sell_Price_Min: number //ราค่าขายต่ำสุด
    sell_Price_Min_Date: ISODateString //วันที่ราคาขายต่ำสุด
    sell_Price_Max: number //ราคาขายสูงสุด
    sell_Price_Max_Date: ISODateString //วันที่ราคาขายสูงสุด

    buy_Price_max: number //ราค่าซื้อสูงสุด
    buy_Price_Max_Date: ISODateString //วันที่ราคาซื้อสูงสุด
    buy_Price_Min: number //ราค่าซื้อต่ำสุด
    buy_Price_Min_Date: ISODateString  //วันที่ราคาซื้อต่ำสุด

    lastUpdated?: string | null

}

interface CurrentPricesOptions {
    locations?: LocationIdentifier[]
    qualities?: ItemQuality[]
}

export type { CurrentPricesOptions }