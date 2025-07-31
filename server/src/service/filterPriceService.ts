import type { Price } from "../interface/priceInterface"
import type { ItemId } from "../types/itemBase"

export const mapAllData = (data: any[], itemInfo: any, itemId: ItemId): Price[] => {
    return data.map((item: any) => ({
        itemName: itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || itemId,
        item_id: itemId,
        city: item.city,
        quantity: item.quality,
        sell_Price_Min: item.sell_price_min,
        sell_Price_Min_Date: item.sell_price_min_date,
        sell_Price_Max: item.sell_price_max,
        sell_Price_Max_Date: item.sell_price_max_date,
        buy_Price_max: item.buy_price_max,
        buy_Price_Max_Date: item.buy_price_max_date,
        buy_Price_Min: item.buy_price_min,
        buy_Price_Min_Date: item.buy_price_min_date,
    } as Price))
}

export const mapPriceData = (data: any[], itemInfo: any, itemId: ItemId): Price[] => {
    return data.filter((item: any) =>
        item.sell_price_min > 0 ||
        item.sell_price_max > 0 ||
        item.buy_price_min > 0 ||
        item.buy_price_max > 0
    ).map((item: any) => ({
        itemName: itemInfo?.LocalizedNames?.['EN-US'] || itemInfo?.UniqueName || itemId,
        item_id: itemId,
        city: item.city,
        quantity: item.quality,
        sell_Price_Min: item.sell_price_min,
        sell_Price_Max: item.sell_price_max,
        buy_Price_max: item.buy_price_max,
        buy_Price_Min: item.buy_price_min,
    } as Price))
}
