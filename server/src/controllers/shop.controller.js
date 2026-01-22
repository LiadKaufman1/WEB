import User from "../models/User.js";

export const buyItem = async (req, res) => {
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

        // Unlimited purchases allowed now
        // if (user.inventory.includes(itemName)) {
        //     return res.status(400).json({ ok: false, error: "ALREADY_OWNED" });
        // }

        user.spentPoints = (user.spentPoints || 0) + itemCost;
        user.inventory.push(itemName);
        await user.save();

        return res.json({ ok: true, inventory: user.inventory, balance: available - itemCost });

    } catch (err) {
        console.error("Shop buy error:", err);
        return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
};
