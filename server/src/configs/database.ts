import { MongoClient, Db } from "mongodb"
import { ItemRepository } from "../repository/itemRepository"
import { DatabaseService } from "../repository/authRepository"

const username = Bun.env.MONGO_USERNAME
const password = Bun.env.MONGO_PASSWORD
const Mongourl = `mongodb+srv://${username}:${password}@albion-api-project.gg0vlg9.mongodb.net/?retryWrites=true&w=majority&appName=albion-api-project`

let mongoClient: MongoClient
let database: Db
let itemRepo: ItemRepository
let databaseService: DatabaseService
let isConnected = false
let isConnecting = false

export const connectToDatabase = {
    connect: async () => {
        // ป้องกันการเชื่อมต่อซ้ำ
        if (isConnected && mongoClient && database && databaseService) {
            console.log("Database already connected, skipping...")
            return
        }

        // ป้องกันการเชื่อมต่อพร้อมกัน
        if (isConnecting) {
            console.log("Database connection in progress, waiting...")
            while (isConnecting) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
            return
        }

        isConnecting = true

        try {
            console.log("Connecting to MongoDB...")
            // ใช้เฉพาะ MongoClient แทนการใช้ทั้ง Mongoose และ MongoClient
            mongoClient = new MongoClient(Mongourl, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            })
            
            await mongoClient.connect()
            database = mongoClient.db("albion-api-project")

            // Test connection
            await database.admin().ping()

            // Initialize repositories
            itemRepo = new ItemRepository()
            databaseService = new DatabaseService(mongoClient, database)
            
            isConnected = true
            console.log("MongoDB connected successfully")

        } catch (error) {
            console.error("Error connecting to MongoDB:", error)
            isConnected = false
            throw error
        } finally {
            isConnecting = false
        }
    },
    
    isConnected: () => isConnected,
    isConnecting: () => isConnecting,
    getDb: () => {
        if (!isConnected || !database) {
            throw new Error("Database not connected. Call connect() first.")
        }
        return database
    },
    getItemRepo: () => {
        if (!isConnected || !itemRepo) {
            throw new Error("ItemRepository not initialized. Call connect() first.")
        }
        return itemRepo
    },
    getDatabaseService: () => {
        if (!isConnected || !databaseService) {
            throw new Error("DatabaseService not initialized. Call connect() first.")
        }
        return databaseService
    },
    
    close: async () => {
        try {
            if (isConnected && mongoClient) {
                await mongoClient.close()
                isConnected = false
                console.log("Disconnected from MongoDB")
            }
        } catch (error) {
            console.error("Error disconnecting from MongoDB:", error)
        }
    }
}