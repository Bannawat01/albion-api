import { Elysia } from "elysia"
import { GoldRepository } from "../repository/goldRepository"
import type { GoldPriceOptions } from "../interface/goldInterface"

export const goldController = new Elysia({ prefix: "/api" })
    .get("/gold", async ({ query }) => {
        try {
            const goldRepository = new GoldRepository()
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