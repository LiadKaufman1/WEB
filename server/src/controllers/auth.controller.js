import User from "../models/User.js";

export const register = async (req, res) => {
    try {
        const { username, password, age } = req.body || {};
        if (!username || !password || age === undefined) {
            return res.status(400).json({ success: false, error: "חסר שם משתמש / סיסמה / גיל" });
        }
        const ageNum = Number(age);
        if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
            return res.status(400).json({ success: false, error: "גיל חייב להיות בין 1 ל-120" });
        }
        const exists = await User.findOne({ username });
        if (exists) {
            return res.status(409).json({ success: false, error: "שם משתמש כבר קיים" });
        }
        const user = await User.create({ username, password, age: ageNum, role: 'parent' });
        return res.json({ success: true, id: user._id });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};

export const checkLogin = async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ error: "חסר שם משתמש או סיסמה" });
        }
        const user = await User.findOne({ username }).select("password role").lean();
        if (!user) return res.json({ ok: false, reason: "NO_USER" });
        if (user.password !== password) return res.json({ ok: false, reason: "BAD_PASS" });
        return res.json({ ok: true, role: user.role || 'child', id: user._id });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
