import { Elysia } from "elysia"
import { GoldRepository } from "../repository/goldRepository"
import type { GoldPriceOptions } from "../interface/goldInterface"

// สร้าง singleton instance ของ GoldRepository
const goldRepository = new GoldRepository()

export const goldController = new Elysia({ prefix: "/api" })
    .get("/gold", async ({ query, set }) => {
        try {
            // เพิ่ม HTTP cache headers
            set.headers['Cache-Control'] = 'public, max-age=300' // 5 minutes
            set.headers['ETag'] = `gold-${Date.now()}`
            const options: GoldPriceOptions = {
                count: query.count ? parseInt(query.count as string) : 2
            }

            const result = await goldRepository.fetchGoldPrices(options)

            if (typeof result === "string") {
                return {
                    success: false,
                    message: result,
                    data: null
                }
            }

            return {
                success: true,
                message: "Gold prices fetched successfully",
                data: result
            }
        } catch (error) {
            console.error("Error in gold controller:", error)
            return {
                success: false,
                message: "Internal server error",
                data: null
            }
        }
    })