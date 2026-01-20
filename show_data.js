import mongoose from "mongoose";

// Connection string from your project
const MONGO_URI = "mongodb+srv://mongoUser:mati1@cluster0.wxwcukg.mongodb.net/MorDB?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
    username: String,
    addition: Number,
    subtraction: Number,
    multiplication: Number,
    division: Number,
    percent: Number,
    spentPoints: Number,
    inventory: [String]
});

const User = mongoose.model("User", UserSchema);

async function showUsers() {
    try {
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
