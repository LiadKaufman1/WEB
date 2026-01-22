import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }
        await mongoose.connect(MONGO_URI, {
            dbName: 'MathGameDB' // Explicitly setting dbName as in original code
        });
        console.log("Connected to Mongo Atlas ✅");
    } catch (err) {
        console.error("Mongo connect error ❌:", err.message);
        process.exit(1);
    }
};
