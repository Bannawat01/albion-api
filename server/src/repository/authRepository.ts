import { Db, MongoClient, Collection } from 'mongodb'
import type { User, OAuthState } from '../types/UserType'

export class DatabaseService {
  private client: MongoClient
  private db: Db
  private users: Collection<User>
  private oauthStates: Collection<OAuthState>
  private indexesCreated = false
  private static indexCreationPromise: Promise<void> | null = null
  private async ensureCollectionExists(collectionName: string) {
    const collections = await this.db.listCollections({ name: collectionName }).toArray()
    if (collections.length === 0) {
      await this.db.createCollection(collectionName)
    }
  }

  constructor(client: MongoClient, db: Db) {
    if (!client || !db) {
      throw new Error('MongoClient and Database are required')
    }

    this.client = client
    this.db = db
    this.users = this.db.collection<User>('users')
    this.oauthStates = this.db.collection<OAuthState>('oauth_states')

    // สร้าง indexes แบบ async
    this.setupIndexes()
  }

  private async setupIndexes() {
    // ป้องกันการสร้าง index ซ้ำโดยใช้ static promise
    if (DatabaseService.indexCreationPromise) {
      await DatabaseService.indexCreationPromise
      return
    }

    if (this.indexesCreated) return

    DatabaseService.indexCreationPromise = this.createIndexes()
    await DatabaseService.indexCreationPromise
  }

  private async createIndexes() {
    try {
      // console.log('Creating database indexes...'); // ลบออก

      const userIndexes = await this.users.listIndexes().toArray()
      const oauthIndexes = await this.oauthStates.listIndexes().toArray()

      const existingUserIndexes = userIndexes.map(idx => Object.keys(idx.key)[0])
      const existingOAuthIndexes = oauthIndexes.map(idx => Object.keys(idx.key)[0])

      const indexPromises = []

      if (!existingUserIndexes.includes('googleId')) {
        indexPromises.push(
          this.users.createIndex({ googleId: 1 }, { unique: true, background: true })
        )
      }

      if (!existingUserIndexes.includes('email')) {
        indexPromises.push(
          this.users.createIndex({ email: 1 }, { unique: true, background: true })
        )
      }

      if (!existingOAuthIndexes.includes('state')) {
        indexPromises.push(
          this.oauthStates.createIndex({ state: 1 }, { unique: true, background: true })
        )
      }

      if (!existingOAuthIndexes.includes('expiresAt')) {
        indexPromises.push(
          this.oauthStates.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true })
        )
      }

      if (indexPromises.length > 0) {
        await Promise.all(indexPromises)
        // console.log(`Created ${indexPromises.length} database indexes`) // ลบออก
      } else {
        // console.log('All database indexes already exist') // ลบออก
      }

      this.indexesCreated = true
    } catch (error) {
      console.error('Error creating indexes:', error)
    }
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    try {
      return await this.users.findOne({ googleId })
    } catch (error) {
      console.error('Error finding user by Google ID:', error)
      throw error
    }
  }

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const userWithTimestamps = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await this.users.insertOne(userWithTimestamps)
      return {
        _id: result.insertedId.toString(),
        ...userWithTimestamps
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async updateUser(googleId: string, userData: Partial<User>): Promise<User | null> {
    try {
      const result = await this.users.findOneAndUpdate(
        { googleId },
        {
          $set: {
            ...userData,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      return result || null
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async saveOAuthState(state: string, codeVerifier: string, redirectUri: string): Promise<void> {
    try {
      await this.oauthStates.insertOne({
        state,
        codeVerifier,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      })
    } catch (error) {
      console.error('Error saving OAuth state:', error)
      throw error
    }
  }

  async getOAuthState(state: string): Promise<OAuthState | null> {
    try {
      return await this.oauthStates.findOne({ state })
    } catch (error) {
      console.error('Error getting OAuth state:', error)
      throw error
    }
  }

  async deleteOAuthState(state: string): Promise<void> {
    try {
      await this.oauthStates.deleteOne({ state })
    } catch (error) {
      console.error('Error deleting OAuth state:', error)
      throw error
    }
  }

  async cleanupExpiredStates(): Promise<void> {
    try {
      const result = await this.oauthStates.deleteMany({
        expiresAt: { $lt: new Date() }
      })
      // เก็บ log เฉพาะเมื่อมีการลบจริงๆ และจำนวนมาก
      if (result.deletedCount > 10) {
        console.log(`Cleaned up ${result.deletedCount} expired OAuth states`)
      }
    } catch (error) {
      console.error('Error cleaning up expired states:', error)
    }
  }

  async disconnect(): Promise<void> {
    console.log('DatabaseService disconnected (connection managed by connection manager)')
  }
}