import { Db } from "mongodb"
import type { ApiConfig } from "../interface/apiInterface"

export class AlbionDataExtractor {
    private db: Db
    private config: ApiConfig
    private requestCount: number = 0;
    private lastResetTime: number = Date.now();

    constructor(db: Db) {
        this.db = db
        this.config = {
            baseUrls: {
                americas: "https://west.albion-online-data.com",
                asia: "https://east.albion-online-data.com",
                europe: "https://europe.albion-online-data.com"
            },
            rateLimits: {
                perMinute: 180,
                perFiveMinutes: 300
            },
            urlMaxLength: 4096
        }
    }

    private async checkRateLimit(): Promise<void> {
        const now = Date.now()
        const timeSinceReset = now - this.lastResetTime

        // Reset counter every minute
        if (timeSinceReset >= 60000) {
            this.requestCount = 0
            this.lastResetTime = now
        }

        // If approaching rate limit, wait
        if (this.requestCount >= this.config.rateLimits.perMinute - 10) {
            const waitTime = 60000 - timeSinceReset + 1000 // Wait until next minute + buffer
            console.log(`Rate limit approaching, waiting ${waitTime}ms`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            this.requestCount = 0
            this.lastResetTime = Date.now()
        }

        this.requestCount++
    }


}


