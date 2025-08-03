import { MongoClient, Db, type MongoClientOptions } from "mongodb"
import { ItemRepository } from "../repository/itemRepository"

const username = Bun.env.MONGO_USERNAME
const password = Bun.env.MONGO_PASSWORD

const url = `mongodb+srv://${username}:${password}@albion-api-project.gg0vlg9.mongodb.net/?retryWrites=true&
w=majority&appName=albion-api-project`

const mongoOptions: MongoClientOptions = {
    minPoolSize: 5,
    maxPoolSize: 20,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    monitorCommands: true,
}

let mongoClient: MongoClient
let database: Db
let itemRepo: ItemRepository

export const connectToDatabase = {
    connect: async () => {
        try {
            mongoClient = new MongoClient(url)
            await mongoClient.connect()
            database = mongoClient.db("albion-api-project")
            console.log("Connected to MongoDB with Mongoose")

            mongoClient.on('connectionPoolCreated', (event) => {
                console.log('connection pool created', event.address)
            })
            mongoClient.on('connectionCreated', (event) => {
                console.log('connection created', event.connectionId)
            })
            mongoClient.on('connectionReady', (event) => {
                console.log('connection ready', event.connectionId)
            })
            mongoClient.on('connectionClosed', (event) => {
                console.log('connection closed', event.connectionId)
            })
            console.log('✅ Connected to MongoDB with Connection Pool')
        } catch (error) {
            console.error('❌ MongoDB Connection Pool Error:', error)
            throw error
        }
    },
    getItemRepo: () => itemRepo,
    getCkient: () => mongoClient,
    getPoolStats: () => {
        if (!mongoClient) return null
        return {
            totalConnections: mongoClient.connect.length || 0,
            availableConnections: 'Available in pool',
            checkedOutConnections: 'Currently in use'
        }
    },
    disconnect: async () => {
        if (mongoClient) {
            await mongoClient.close()
            console.log('✅ Disconnected from MongoDB')
        }
    }

}

