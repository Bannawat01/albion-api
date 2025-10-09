import mongoose from "mongoose"
import { MongoClient, Db } from "mongodb"
import { ItemRepository } from "../repository/itemRepository"
import { DatabaseService } from "../repository/authRepository"

// Connection precedence:
// 1. MONGODB_URI
// 2. MONGO_USERNAME + MONGO_PASSWORD (+ optional MONGO_HOST)
// 3. docker default credential (root/rootpassword@mongo)
// 4. localhost fallback

const directUri = Bun.env.MONGODB_URI
const username = Bun.env.MONGO_USERNAME
const password = Bun.env.MONGO_PASSWORD
const host = Bun.env.MONGO_HOST || 'albion-api-project.gg0vlg9.mongodb.net'

let resolvedUrl: string
if (directUri) {
    resolvedUrl = directUri
} else if (username && password) {
    resolvedUrl = `mongodb+srv://${username}:${password}@${host}/?retryWrites=true&w=majority&appName=albion-api-project`
} else {
    resolvedUrl = 'mongodb://root:rootpassword@localhost:27017/albion_dev?authSource=admin'
}
const fallbackLocal = 'mongodb://root:rootpassword@localhost:27017/albion_dev?authSource=admin'

let database: Db
let itemRepo: ItemRepository
let databaseService: DatabaseService
let isConnected = false
let isConnecting = false

const baseMongoOptions = {
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
    monitorCommands: true,
} as const

let mongoClient = new MongoClient(resolvedUrl, baseMongoOptions)

export const connectToDatabase = {
    connect: async () => {
        // ป้องกันการ connect ซ้ำ
        if (isConnected) {
            console.log("Already connected to MongoDB, skipping...")
            return
        }

        if (isConnecting) {
            console.log("Connection in progress, waiting...")
            return
        }

        isConnecting = true

        try {
            const dbName = Bun.env.MONGO_DB || 'albion_dev'
            const attempt = async (uri: string, label: string) => {
                console.log(`[db] Attempting connection (${label}): ${uri}`)
                await mongoose.connect(uri)
                await mongoClient.connect()
                database = mongoClient.db(dbName)
                console.log(`[db] Connected successfully using ${label}`)
            }

            try {
                await attempt(resolvedUrl, 'primary')
            } catch (err: any) {
                const msg = err?.message || ''
                console.error('[db] Primary connection failed:', msg)

                // Conditions for attempting localhost fallback:
                // 1. DNS errors (ENOTFOUND / EAI_AGAIN) AND the primary URI host is literally 'mongo'
                //    (common when user reuses docker-compose MONGODB_URI while running directly on host)
                // 2. Original legacy case: no explicit directUri/credentials & generic connect/auth failures
                const isDockerHostMongo = /mongodb:\/\/[^@]*:?[^@]*@?mongo(?::|\/)/i.test(resolvedUrl)
                const dnsError = /ENOTFOUND|EAI_AGAIN/i.test(msg)
                const genericAuthOrConn = /failed to connect|bad auth/i.test(msg)
                const needLocalFallback = (dnsError && isDockerHostMongo) || (!directUri && !username && genericAuthOrConn)

                if (needLocalFallback) {
                    const original = resolvedUrl
                    try {
                        console.warn('[db] Falling back to localhost MongoDB (detected host environment).')
                        // Ensure previous (failed) connections are fully closed before new attempt
                        try { await mongoose.disconnect().catch(()=>{}) } catch {}
                        try { await mongoClient.close().catch(()=>{}) } catch {}
                        mongoClient = new MongoClient(fallbackLocal, baseMongoOptions)
                        await attempt(fallbackLocal, 'localhost-fallback')
                    } catch (e2) {
                        console.error('[db] Localhost fallback failed:', (e2 as any).message)
                        console.error('[db] Original URI was:', original)
                        throw err
                    }
                } else {
                    throw err
                }
            }
            isConnected = true // ✅ สำคัญ!

            // Initialize ItemRepository with native MongoDB Db
            itemRepo = new ItemRepository()

        } catch (error) {
            console.error("Error connecting to MongoDB:", error)
            throw error
        } finally {
            isConnecting = false
        }
    },
    getClient() {
        return mongoClient
    },
    getDb: () => database,
    getItemRepo: () => itemRepo,
    isConnected: () => isConnected,

    // Add connection monitoring
    getConnectionStats: () => {
        return {
            isConnected,
            readyState: mongoose.connection.readyState,
            name: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            db: mongoose.connection.db?.databaseName || 'unknown'
        }
    },

    close: async () => {
        try {
            await mongoose.disconnect()
            await mongoClient?.close()
            console.log("Disconnected from MongoDB")
        } catch (error) {
            console.error("Error disconnecting from MongoDB:", error)
        }
    }
}