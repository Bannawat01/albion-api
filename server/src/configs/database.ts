import mongoose, { connect } from "mongoose";
const username = process.env.MONGO_USERNAME || 'defaultUser';
const password = process.env.MONGO_PASSWORD || 'defaultPass';
const dbName = 'albion-api-project';
const MONGO_URI =`mongodb+srv://${username}:${password}@albion-api-project.gg0vlg9.mongodb.net/?retryWrites=true&w=majority&appName=${dbName}`

export const connectiontoDatabase = {
    connect: async () => {
        try{
            await mongoose.connect(MONGO_URI)
            console.log("Connected to MongoDB successfully");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    }
}