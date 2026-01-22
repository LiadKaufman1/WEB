import mongoose from "mongoose";
import User from "../src/models/User.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env from server root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

async function showUsers() {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI not found in environment");
        }
        await mongoose.connect(MONGO_URI, { dbName: 'MathGameDB' });
        console.log("✅ מחובר למסד הנתונים!\n");

        const users = await User.find({});

        console.log("📊 === רשימת משתמשים והישגים === 📊");
        users.forEach(u => {
            const total = (u.addition || 0) + (u.subtraction || 0) + (u.multiplication || 0) + (u.division || 0) + (u.percent || 0);
            console.log(`
👤 משתמש: ${u.username}
   🏆 סה"כ נקודות: ${total}
   💰 נקודות שבזבז: ${u.spentPoints || 0}
   🛍️ מוצרים: ${u.inventory.join(', ') || 'אין'}
   ------------------------------`);
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

showUsers();
