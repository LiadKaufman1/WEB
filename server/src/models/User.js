import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    role: { type: String, enum: ['parent', 'child'], default: 'child' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Stats
    addition: { type: Number, default: 0 },
    subtraction: { type: Number, default: 0 },
    multiplication: { type: Number, default: 0 },
    division: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },

    // Mistakes
    additionMistakes: { type: Number, default: 0 },
    subtractionMistakes: { type: Number, default: 0 },
    multiplicationMistakes: { type: Number, default: 0 },
    divisionMistakes: { type: Number, default: 0 },
    percentMistakes: { type: Number, default: 0 },

    // Shop
    spentPoints: { type: Number, default: 0 },
    inventory: { type: [String], default: [] }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
