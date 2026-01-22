import User from "../models/User.js";

export const getParentData = async (req, res) => {
    try {
        const { password } = req.body;
        // Hardcoded password from original code
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
