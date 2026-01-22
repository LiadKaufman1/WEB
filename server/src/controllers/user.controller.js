import User from "../models/User.js";

const scoreFields = ["addition", "subtraction", "multiplication", "division", "percent"];

export const getStats = async (req, res) => {
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
};

export const updateScore = async (req, res) => {
    try {
        const { field } = req.params;
        if (!scoreFields.includes(field)) {
            return res.status(400).json({ ok: false, error: "INVALID_FIELD" });
        }

        const { username, points } = req.body;
        if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

        const pointsToAdd = typeof points === "number" && points > 0 ? points : 1;
        const update = { $inc: {} };
        update.$inc[field] = pointsToAdd;

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
};

export const recordMistake = async (req, res) => {
    try {
        const { field } = req.params;
        const validFields = scoreFields; // reuse existing list
        if (!validFields.includes(field)) {
            return res.status(400).json({ ok: false, error: "INVALID_FIELD" });
        }

        const { username } = req.body;
        if (!username) return res.status(400).json({ ok: false, error: "NO_USERNAME" });

        const mistakeField = `${field}Mistakes`;
        const update = { $inc: { [mistakeField]: 1 } };

        const user = await User.findOneAndUpdate(
            { username },
            update,
            { new: true, projection: { password: 0 } }
        );

        if (!user) return res.status(404).json({ ok: false, error: "NO_USER" });
        res.json({ ok: true, [mistakeField]: user[mistakeField] });
    } catch (e) {
        console.log("ERR:", e);
        res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
};

export const getFieldFrequency = async (req, res) => {
    try {
        const { field } = req.params;
        // Note: original code checked against scoreFields for update but logic for get was separate.
        // But it seems it assumes valid fields. I'll add validation if needed, assuming the request comes with correct field.
        // The original code endpoint path was `/user/${field}-f`

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
};
