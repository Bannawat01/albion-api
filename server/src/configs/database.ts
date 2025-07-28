import mongoose, { connect } from "mongoose";

const username = Bun.env.MONGO_USERNAME;
const password = Bun.env.MONGO_PASSWORD;

const url = `mongodb+srv://${username}:${password}@albion-api-project.gg0vlg9.mongodb.net/?retryWrites=true&w=majority&appName=albion-api-project`

export const connectToDatabase = {
connect : async () => {
    try {
        await mongoose.connect(url)
        console.log("Connected to MongoDB");
    }catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}
};