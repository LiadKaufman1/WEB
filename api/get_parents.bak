import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mongoUser:mati1@cluster0.wxwcukg.mongodb.net/MorDB?retryWrites=true&w=majority";

let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            dbName: 'MathGameDB'
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("Standalone connected to Mongo");
    } catch (err) {
        console.error("Standalone Mongo Error:", err);
        throw err;
    }
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed', method: req.method });
    }

    try {
        await connectToDatabase();

        const { password } = req.body;
        if (password !== "123456") {
            return res.status(403).json({ ok: false, error: "WRONG_PASSWORD" });
        }

        const users = await User.find({}).select("-password -__v").lean();
        res.status(200).json({ ok: true, users, version: "Standalone v1" });

    } catch (error) {
        console.error("Standalone Function Error:", error);
        res.status(500).json({ ok: false, error: "SERVER_ERROR", details: error.message });
    }
}
