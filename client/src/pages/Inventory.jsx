import React, { useEffect, useState } from "react";
import { userService } from "../services/user.service";

const SHOP_ITEMS = [
    { id: "medal_gold_real", name: "מדליית זהב אמיתית 🥇", emoji: "🥇" },
    { id: "cat_boots", name: "החתול במגפיים 👢", emoji: "👢" },
    { id: "wisdom_potion", name: "שיקוי חוכמה 🧪", emoji: "🧪" },
    { id: "crown", name: "כתר המלך 👑", emoji: "👑" },
];

export default function Inventory() {
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        async function load() {
            const username = localStorage.getItem("username");
            if (!username) return;
            const data = await userService.getStats(username);
            if (data.ok && data.user.inventory) {
                setInventory(data.user.inventory);
            }
            setLoading(false);
        }
        load();
    }, []);

    // Aggregate items
    const counts = {};
    inventory.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });

    return (
        <div className="mx-auto max-w-4xl p-6 min-h-screen">
            <h1 className="text-4xl font-black text-slate-800 mb-8 text-center">🎒 התיק שלי</h1>

            {loading ? (
                <div className="text-center text-slate-400">טוען...</div>
            ) : inventory.length === 0 ? (
                <div className="text-center text-xl text-slate-500 font-medium">התיק שלך עדיין ריק... רוץ לחנות! 🏃‍♂️</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(counts).map(([itemId, count]) => {
                        const itemDef = SHOP_ITEMS.find(i => i.id === itemId);
                        if (!itemDef) return null;
                        return (
                            <div key={itemId} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center">
                                <div className="text-6xl mb-4">{itemDef.emoji}</div>
                                <div className="font-bold text-slate-800 mb-2">{itemDef.name}</div>
                                <div className="bg-blue-100 text-blue-700 font-bold px-4 py-1 rounded-full text-sm">
                                    יש לך: {count}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
