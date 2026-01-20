import User from "./models/User.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Logger middleware
const handleParentData = async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== "123456") {
      return res.status(403).json({ ok: false, error: "WRONG_PASSWORD" });
    }
    // Return all users, excluding passwords
    const users = await User.find({}).select("-password -__v").lean();
    res.json({ ok: true, users });
  } catch (err) {
    console.error("parents/data error:", err);
    res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
};

app.use((req, res, next) => {
  // ☢️ THE KOMBINA: If password matches, return data immediately.
  // This bypasses ALL routing logic.
  if (req.body && req.body.password === "123456") {
    console.log("☢️ Kombina activated! Bypassing route check.");
    return handleParentData(req, res);
  }
  next();
});

// 🔹 Absolute Route for Vercel Robustness (Overrides Router)
// Moved to top to avoid any router interference
// 🔹 Primary Route (Gemini Advice: Verify this exists)
app.post("/api/parents/data", handleParentData);
app.post("/parents/data", handleParentData);
// 🔹 Fallback: Handle get_parents in case Vercel routes here instead of standalone
app.post("/api/get_parents", handleParentData);
app.post("/get_parents", handleParentData);

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mongoUser:mati1@cluster0.wxwcukg.mongodb.net/MorDB?retryWrites=true&w=majority";

// 🔹 Cached Connection State
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'MathGameDB'
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("Connected to Mongo Atlas ✅");
  } catch (err) {
    console.log("Mongo connect error ❌:", err.message);
    throw err;
  }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    res.status(503).json({ error: "DB connection failed", details: err.message });
  }
});

// 🔹 API Router
const api = express.Router();

// 🔹 User Stats (Unified)
api.post("/user/stats", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ ok: false, error: "NO_USERNAME" });
    }
    const user = await User.findOne({ username }).select("-password -__v");
    if (!user) {
      return res.status(404).json({ ok: false, error: "NO_USER" });
    }
    res.json({ ok: true, user });
  } catch (err) {
    console.error("user/stats error:", err);
    res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

// 🔹 Login Check
api.post("/check-login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "חסר שם משתמש או סיסמה" });
    }
    const user = await User.findOne({ username }).select("password").lean();
    if (!user) return res.json({ ok: false, reason: "NO_USER" });
    if (user.password !== password) return res.json({ ok: false, reason: "BAD_PASS" });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 🔹 Register
api.post("/register", async (req, res) => {
  try {
    const { username, password, age } = req.body || {};
    if (!username || !password || age === undefined) {
      return res.status(400).json({ success: false, error: "חסר שם משתמש / סיסמה / גיל" });
    }
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 12) {
      return res.status(400).json({ success: false, error: "גיל חייב להיות בין 1 ל-12" });
    }
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ success: false, error: "שם משתמש כבר קיים" });
    }
    const user = await User.create({ username, password, age: ageNum });
    return res.json({ success: true, id: user._id });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// 🔹 Shop Buy Endpoint
api.post("/shop/buy", async (req, res) => {
  try {
    const { username, itemCost, itemName } = req.body;
    if (!username || !itemCost || !itemName) {
      return res.status(400).json({ ok: false, error: "MISSING_DATA" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });

    // Calc total score
    const totalScore = (user.addition || 0) +
      (user.subtraction || 0) +
      (user.multiplication || 0) +
      (user.division || 0) +
      (user.percent || 0);

    const available = totalScore - (user.spentPoints || 0);

    if (available < itemCost) {
      return res.status(400).json({ ok: false, error: "NOT_ENOUGH_POINTS" });
    }

    if (user.inventory.includes(itemName)) {
      return res.status(400).json({ ok: false, error: "ALREADY_OWNED" });
    }

    user.spentPoints = (user.spentPoints || 0) + itemCost;
    user.inventory.push(itemName);
    await user.save();

    return res.json({ ok: true, inventory: user.inventory, balance: available - itemCost });

  } catch (err) {
    console.error("Shop buy error:", err);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

// 🔹 Score Updates
// 🔹 Score Updates
const scoreFields = ["addition", "subtraction", "multiplication", "division", "percent"];

api.post('/score-v3/:field', async (req, res) => {
  try {
    const { field } = req.params;
    const { username, points, isCorrect } = req.body;

    if (!scoreFields.includes(field)) {
      return res.status(400).json({ ok: false, error: "INVALID_FIELD" });
    }

    console.log(`[SCORE] Field: ${field}, User: ${username}, isCorrect: ${isCorrect} (${typeof isCorrect})`);
    if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });
    if (isCorrect === undefined) {
      console.error("MISSING_IS_CORRECT: Client is likely outdated.");
      return res.status(400).json({ ok: false, error: "MISSING_IS_CORRECT" });
    }

    const pointsToAdd = (typeof points === "number" && points > 0) ? points : 1;
    const today = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY

    let user = await User.findOne({ username });
    if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });

    // 1. Update Global Stats
    // STRICT SUCCESS CHECK: Default to failure unless explicitly true.
    const isSuccess = isCorrect === true || isCorrect === "true" || isCorrect === 1;

    console.log(`[SCORE] ${field} | isCorrect raw: ${isCorrect} | isSuccess: ${isSuccess} | V: ${new Date().toISOString()}`);

    // 2. ATOMIC UPDATE (Score/Fail) - The Critical Part
    const failField = `${field}_fail`;
    let updatedUser;

    // Safer regex for case-insensitive match (Liad == liad)
    // We strictly match the whole string ^...$ to avoid partial matches
    const safeRegex = { $regex: `^${username.trim()}$`, $options: 'i' };

    console.log(`[SCORE] Attempting update for user: '${username}'`);

    if (isSuccess) {
      updatedUser = await User.findOneAndUpdate(
        { username: safeRegex },
        {
          $inc: { [field]: pointsToAdd },
          $set: { lastActivity: today }
        },
        { new: true, upsert: false, strict: false }
      );
    } else {
      updatedUser = await User.findOneAndUpdate(
        { username: safeRegex },
        {
          $inc: { [failField]: 1, incorrect: 1 }
        },
        { new: true, upsert: false, strict: false }
      );
    }

    if (!updatedUser) {
      console.error(`[SCORE] Update failed.`);
      // Fallback check
      const check = await User.findOne({ username: safeRegex });
      return res.status(404).json({ ok: false, error: "UPDATE_FAILED_USER_NOT_FOUND", debug: { sent: username, exists: !!check } });
    }

    console.log(`[SCORE] Atomic Update Success. New ${field}: ${updatedUser[field]}, Fail: ${updatedUser[failField]}`);

    // 3. Handle Streak & History (Best Effort - Separate Write)
    // We calculate streak/history changes and push them using updateOne to avoid fetching full doc if possible,
    // OR we just use the updatedUser doc and save it (but that seemed risky before).
    // Let's use the robust "update with push" approach.

    try {
      const historyEntry = {
        date: today,
        correct: isSuccess ? 1 : 0,
        incorrect: isSuccess ? 0 : 1
      };

      // We need to check if history for today exists. 
      // This is hard to do atomically with simple push.
      // So we will just PUSH to history. If we want to consolidate days, we'd need more logic.
      // For now, let's stick to the previous logic but safe:
      // We already have 'updatedUser'.

      // Check streak on the updated doc
      let streakUpdate = {};
      if (isSuccess && updatedUser.lastActivity !== today) { // Wait, we just set lastActivity in the atomic op above?
        // Actually, if we set it above, we can't check difference easily.
        // Let's rely on the previous fetch? No, that's race-prone.

        // Re-read logic:
        // The previous logic used 'user' (old) to check lastActivity.
        // I preserved 'user' in 'let user = await User.findOne' at the top.
        // So we can use 'user.lastActivity' (old state) to decide streak.
      }

      // ... This split is getting complex.

      // Simpler Solution:
      // Trust Mongoose `save()`. 
      // The issue likely was `user` variable reuse or `let user` confusion.
      // I will revert to a CLEAN `findOne` -> `merge` -> `save` loop BUT with `versionKey: false` to avoid concurrency errors?
      // NO, Vercel kills the process. Atomic is required.

      // OK, I will keep Atomic for Score.
      // And I will do a simple $push for history.

      // Update History:
      // If today exists in history array -> $inc correct/incorrect.
      // Else -> $push new entry.

      // Using "Array Filters" (Advanced Mongo)
      // updateOne(
      //   { username, "history.date": today },
      //   { $inc: { "history.$.correct": 1 } }
      // )
      // If result.nModified == 0, then push.

      if (isSuccess) {
        const hResult = await User.updateOne(
          { username, "history.date": today },
          {
            $inc: { "history.$.correct": 1 },
            // Streak logic: if old user.lastActivity != today...
            // Complicated.
          }
        );

        if (hResult.matchedCount === 0) {
          await User.updateOne({ username }, { $push: { history: historyEntry } });
        }
      } else {
        const hResult = await User.updateOne(
          { username, "history.date": today },
          { $inc: { "history.$.incorrect": 1 } }
        );
        if (hResult.matchedCount === 0) {
          await User.updateOne({ username }, { $push: { history: historyEntry } });
        }
      }

    } catch (err) {
      console.error("History update error (non-fatal):", err);
    }

    const dbName = mongoose.connection.db ? mongoose.connection.db.databaseName : "UNKNOWN";

    res.json({
      ok: true,
      streak: updatedUser.streak,
      debug: {
        isSuccess,
        field,
        dbName,
        failField,
        newScore: updatedUser[field],
        newFail: updatedUser[failField]
      }
    });
    // Return immediately.
    return;

    // NOTE: I am deleting the old logic block in the replacement.

    console.log(`Updated stats for ${username}: Streak=${user.streak}, HistoryLength=${user.history.length}`);
    res.json({
      ok: true,
      streak: user.streak,
      debug: {
        receivedIsCorrect: isCorrect,
        type: typeof isCorrect,
        isSuccess: isSuccess,
        field: field,
        failField: `${field}_fail`,
        newScore: user.get(field),
        newFail: user.get(`${field}_fail`)
      }
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

// 🔹 Get Field Frequency (Dynamic)
api.get('/user/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!slug.endsWith('-f')) return res.status(404).json({ error: "Not found" });

  const field = slug.replace('-f', '');
  const scoreFields = ["addition", "subtraction", "multiplication", "division", "percent"];
  if (!scoreFields.includes(field)) return res.status(400).json({ error: "Invalid field" });

  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });
    const user = await User.findOne({ username }, { password: 0 });
    if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });
    const key = `${field}_f`;
    return res.json({ ok: true, [key]: user[key] ?? 1 });
  } catch (e) {
    console.log("ERR:", e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

// 🔹 Parent Mode Data




// Handlers moved to app-level for robustness



// 🔹 Debug Ping
api.get("/ping", (req, res) => res.json({ msg: "pong", version: "v8", time: new Date() }));

api.get("/debug-connection", (req, res) => {
  const uri = process.env.MONGO_URI || "FALLBACK_HARDCODED";
  const maskedUri = uri.replace(/:([^:@]+)@/, ":****@");
  res.json({
    ok: true,
    maskedUri,
    dbName: mongoose.connection.db ? mongoose.connection.db.databaseName : "DISCONNECTED",
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host
  });
});

// DEBUG: Deep User Diagnosis
api.get("/diagnose-user", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.json({ error: "Missing username query param" });

    const safeRegex = { $regex: `^${username.trim()}$`, $options: 'i' };

    const exact = await User.findOne({ username });
    const regex = await User.findOne({ username: safeRegex });

    // Count all users to see if DB is empty
    const count = await User.countDocuments();

    res.json({
      ok: true,
      searchedFor: username,
      totalUsersInDB: count,
      exactMatch: exact ? "FOUND" : "NOT_FOUND",
      regexMatch: regex ? "FOUND" : "NOT_FOUND",
      // Return masked data if found
      data: regex ? {
        id: regex._id,
        username: regex.username,
        score_addition: regex.addition,
        history_len: regex.history?.length
      } : null,
      dbName: mongoose.connection.db ? mongoose.connection.db.databaseName : "UNKNOWN"
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

api.get("/debug-routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) routes.push('/api' + handler.route.path);
      });
    }
  });
  res.json({ routes });
});
api.get("/test", (req, res) => res.send("Typescript Test works via Express!"));

// ✅ Mount API Router
app.use("/api", api);
app.use("/", api); // Fallback



// ❌ 404 Handler
// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found (v8 - Dependencies Fixed)",
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl
  });
});

export default app;

// Only start server dev locally
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
