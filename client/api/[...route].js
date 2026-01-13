import User from "./models/User.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Logger middleware
app.use((req, res, next) => {
  console.log(req.method, req.url, req.body);
  next();
});

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mongoUser:mati1@cluster0.wxwcukg.mongodb.net/MorDB?retryWrites=true&w=majority";

// 🔹 Cached Connection State
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(MONGO_URI, {
      // Optional: Add timeouts if needed
      serverSelectionTimeoutMS: 5000,
      dbName: 'MathGameDB' // 🔹 Force separation from other projects
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("Connected to Mongo Atlas ✅");
  } catch (err) {
    console.log("Mongo connect error ❌:", err.message);
    throw err; // Let the handler catch it
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

// Delete ensureDb function and usage since middleware handles it
// ... (rest of the routes without ensureDb calls)

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
    // DB guaranteed by middleware
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
    // DB guaranteed by middleware
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

// 🔹 Score Updates
const scoreFields = ["addition", "subtraction", "multiplication", "division", "percent"];

scoreFields.forEach(field => {
  api.post(`/score/${field}`, async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

      const update = { $inc: {} };
      update.$inc[field] = 1;

      const user = await User.findOneAndUpdate(
        { username },
        update,
        { new: true, projection: { password: 0 } }
      );

      if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });
      res.json({ ok: true, [field]: user[field] });
    } catch (e) {
      console.log("ERR:", e);
      res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
  });

  // 🔹 Get Field Frequency (e.g. addition_f)
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

// 🔹 Debug Ping
api.get("/ping", (req, res) => res.json({ msg: "pong", time: new Date() }));
api.get("/test", (req, res) => res.send("Typescript Test works via Express!"));

// ✅ Mount API Router (HANDLE BOTH /api and / for Vercel robustness)
app.use("/api", api);
app.use("/", api); // Fallback if prefix is stripped

// ❌ 404 Handler (Force JSON response)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found in Express", path: req.path });
});

export default app;

// Only start server dev locally
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
