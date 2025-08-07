import { INDEX_DEFINITIONS } from './indexs'
import { connectToDatabase } from './database'
import { ConnectionError } from '../middleware/customError'


export class DatabaseManager {
    private static instance: DatabaseManager
    private indexesInitialized = false

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager()
        }
        return DatabaseManager.instance
    }

    async initializeIndexes() {
        if (this.indexesInitialized) {
            console.log('Indexes already initialized, skipping...')
            return
        }

        try {
            // ขั้นตอนที่ 2: ตรวจสอบการเชื่อมต่อฐานข้อมูล
            const db = connectToDatabase.getDb()
            if (!db) {
                throw new Error('Database connection not available')
            }

            console.log('Starting index initialization...')

            // ขั้นตอนที่ 3: วนลูปผ่าน INDEX_DEFINITIONS
            for (const [collectionName, indexes] of Object.entries(INDEX_DEFINITIONS)) {
                // ขั้นตอนที่ 4: ตรวจสอบและสร้าง collection
                const collections = await db.listCollections({ name: collectionName }).toArray()
                if (collections.length === 0) {
                    await db.createCollection(collectionName)
                }

                const collection = db.collection(collectionName)

                // ขั้นตอนที่ 5: สร้าง indexes สำหรับแต่ละ collection
                for (const indexDef of indexes) {
                    try {
                        const result = await collection.createIndex(
                            indexDef.fields as any,
                            {
                                ...indexDef.options,
                                background: true // สร้าง index ใน background
                            }
                        )
                    } catch (error) {
                        throw new ConnectionError("Failed to create index")
                    }
                }
            }

            // ขั้นตอนที่ 6: อัพเดทสถานะและแสดงผลลัพธ์
            this.indexesInitialized = true
        } catch (error: any) {
            console.error('❌ Error initializing indexes:', error)
            throw new ConnectionError(error.message)
        }
    }
    async healthCheck() {
        try {
            const db = await connectToDatabase.getDb()
            if (!db) {
                throw new Error('Database connection not available')
            }
            await db.command({ ping: 1 })
            return {
                status: 'healthy',
                message: 'Database connection is healthy'
            }
        } catch (error) {
            return {
                status: 'unhealthy',
                message: 'Database connection is unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }
}



