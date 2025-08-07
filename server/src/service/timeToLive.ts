import { ItemRepository } from "../repository/itemRepository"

export class TTLCache<T> {

    private cache = new Map<string, { data: T; expiry: number }>()

    /**
     * เก็บข้อมูลใน cache พร้อมกำหนด TTL
     * @param key - คีย์สำหรับเก็บข้อมูล
     * @param value - ข้อมูลที่ต้องการเก็บ
     * @param ttlMs - เวลาหมดอายุในหน่วย milliseconds
     */
    set(key: string, value: T, ttlMs: number): void {
        const expiry = Date.now() + ttlMs
        this.cache.set(key, { data: value, expiry })
    }

    /**
     * ดึงข้อมูลจาก cache
     * @param key - คีย์ของข้อมูลที่ต้องการ
     * @returns ข้อมูลหรือ null หากหมดอายุหรือไม่มีข้อมูล
     */
    get(key: string): T | null {
        const item = this.cache.get(key)
        if (!item) return null

        // ตรวจสอบว่าหมดอายุหรือยัง
        if (Date.now() > item.expiry) {
            this.cache.delete(key)
            return null
        }

        return item.data
    }

    /**
     * ลบข้อมูลออกจาก cache
     * @param key - คีย์ของข้อมูลที่ต้องการลบ
     */
    delete(key: string): boolean {
        return this.cache.delete(key)
    }

    /**
     * ตรวจสอบว่ามีข้อมูลอยู่ใน cache หรือไม่ (และยังไม่หมดอายุ)
     * @param key - คีย์ของข้อมูลที่ต้องการตรวจสอบ
     */
    has(key: string): boolean {
        const item = this.cache.get(key)
        if (!item) return false

        if (Date.now() > item.expiry) {
            this.cache.delete(key)
            return false
        }

        return true
    }

    /**
     * ล้างข้อมูลทั้งหมดใน cache
     */
    clear(): void {
        this.cache.clear()
    }

    /**
     * ล้างข้อมูลที่หมดอายุแล้วออกจาก cache
     */
    cleanup(): void {
        const now = Date.now()
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key)
            }
        }
    }

    /**
     * ดูจำนวนข้อมูลใน cache
     */
    size(): number {
        this.cleanup() // ล้างข้อมูลหมดอายุก่อน
        return this.cache.size
    }

    /**
     * ดูข้อมูลทั้งหมดใน cache (ที่ยังไม่หมดอายุ)
     */
    entries(): Array<[string, T]> {
        this.cleanup()
        const result: Array<[string, T]> = []
        for (const [key, item] of this.cache.entries()) {
            result.push([key, item.data])
        }
        return result
    }
}

// สร้าง instance สำหรับใช้งานทั่วไป
export const globalTTLCache = new TTLCache<any>()

// ค่าคงที่สำหรับ TTL ที่ใช้บ่อย
export const TTL_CONSTANTS = {
    ONE_MINUTE: 60 * 1000,
    FIVE_MINUTES: 5 * 60 * 1000,
    TEN_MINUTES: 10 * 60 * 1000,
    THIRTY_MINUTES: 30 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000
} as const
