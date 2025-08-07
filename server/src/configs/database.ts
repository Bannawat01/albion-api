import mongoose from "mongoose"
import { MongoClient, Db } from "mongodb"
import { ItemRepository } from "../repository/itemRepository"
import { DatabaseService } from "../repository/authRepository"

const username = Bun.env.MONGO_USERNAME
const password = Bun.env.MONGO_PASSWORD

const url = `mongodb+srv://${username}:${password}@albion-api-project.gg0vlg9.mongodb.net/?retryWrites=true&w=majority&appName=albion-api-project`

let mongoClient: MongoClient
let database: Db
let itemRepo: ItemRepository
let databaseService: DatabaseService
let isConnected = false
let isConnecting = false

export const connectToDatabase = {
    connect: async () => {
        try {
            // Connect with mongoose for schema-based operations
            await mongoose.connect(url)
            console.log("Connected to MongoDB with Mongoose")

            // Also connect with native MongoDB driver for repository pattern
            mongoClient = new MongoClient(url)
            await mongoClient.connect()
            database = mongoClient.db("albion-api-project")

            // Initialize ItemRepository with native MongoDB Db
            itemRepo = new ItemRepository()
            // console.log("MongoDB native client connected")

        } catch (error) {
            console.error("Error connecting to MongoDB:", error)
            throw error
        } finally {
            isConnecting = false
        }
    },
    getDb: () => database,
    getItemRepo: () => itemRepo,
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