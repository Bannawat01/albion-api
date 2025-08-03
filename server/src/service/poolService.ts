import type { MiddlewareOptions } from "mongoose"

export interface MongoOptions extends MiddlewareOptions {
    minPoolSize: 5,
    maxPoolSize: 20,
    maxIdleTimeMS: 30000,
    connectTimeOutMS: 10000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    monitorCommands: true,
}