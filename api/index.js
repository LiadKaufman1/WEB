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
const scoreFields = ["addition", "subtraction", "multiplication", "division", "percent"];

scoreFields.forEach(field => {
  api.post(`/score/${field}`, async (req, res) => {
    try {
      const { username, points, isCorrect } = req.body;
      if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

      const pointsToAdd = (typeof points === "number" && points > 0) ? points : 1;
      const today = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY

      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });

      // 1. Update Global Stats
      if (isCorrect !== false) { // Default to true if undefined
        user[field] = (user[field] || 0) + pointsToAdd;
      } else {
        const incorrectField = `${field}_incorrect`;
        user[incorrectField] = (user[incorrectField] || 0) + 1;
        user.incorrect = (user.incorrect || 0) + 1; // Keep global for legacy/total tracking
      }

      // 2. Handle Streak

      if (user.lastActivity !== today) {
        // Check if yesterday was the last activity
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toLocaleDateString("en-GB");

        if (user.lastActivity === yStr) {
          user.streak = (user.streak || 0) + 1;
        } else {
          // Missed a day or first time
          user.streak = 1;
        }
        user.lastActivity = today;
      }

      // Handle History
      let daily = user.history.find(h => h.date === today);
      if (daily) {
        if (isCorrect !== false) daily.correct = (daily.correct || 0) + 1;
        else daily.incorrect = (daily.incorrect || 0) + 1;
      } else {
        user.history.push({
          date: today,
          correct: (isCorrect !== false) ? 1 : 0,
          incorrect: (isCorrect === false) ? 1 : 0
        });
      }

      user.markModified('history'); // Ensure Mongoose detects the change
      await user.save();

      console.log(`Updated stats for ${username}: Streak=${user.streak}, HistoryLength=${user.history.length}`);
      res.json({ ok: true, streak: user.streak });
    } catch (e) {
      console.log("ERR:", e);
      res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
  });

  // 🔹 Get Field Frequency
  api.get(`/user/${field}-f`, async (req, res) => {
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
});

// 🔹 Parent Mode Data




// Handlers moved to app-level for robustness



// 🔹 Debug Ping
api.get("/ping", (req, res) => res.json({ msg: "pong", version: "v8", time: new Date() }));
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
