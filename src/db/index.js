import mongoose from 'mongoose'

const DB_NAME = 'standard-express'

export const connectMongoDB = async () => {
    try {
        const connectionResponse = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log('DB connection successfully', connectionResponse.connection.host);
    } catch (error) {
        console.log("DB Connection Error", error);
        process.exit(1);
    }
}
