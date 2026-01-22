import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },

    // Stats
    addition: { type: Number, default: 0 },
    subtraction: { type: Number, default: 0 },
    multiplication: { type: Number, default: 0 },
    division: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },

    // Shop
    spentPoints: { type: Number, default: 0 },
    inventory: { type: [String], default: [] }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
