import React, { useEffect, useMemo, useState } from "react";
import API_URL from "../config";

const API = API_URL;

const SILVER = 30;
const GOLD = 60;

const SHOP_ITEMS = [
  { id: "medal_gold_real", name: "מדליית זהב אמיתית 🥇", cost: 100, emoji: "🥇" },
  { id: "cat_boots", name: "החתול במגפיים 👢", cost: 200, emoji: "👢" },
  { id: "wisdom_potion", name: "שיקוי חוכמה 🧪", cost: 50, emoji: "🧪" },
  { id: "crown", name: "כתר המלך 👑", cost: 500, emoji: "👑" },
];

function getMedal(value) {
  const v = Number(value || 0);
  if (v >= GOLD) {
    return {
      emoji: "🥇",
      title: "זהב",
      hint: "מדהים! אתה אלוף החשבון! 🏆",
      pill: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }
  if (v >= SILVER) {
    return {
      emoji: "🥈",
      title: "כסף",
      hint: "כל הכבוד! תמשיך לזהב! 🚀",
      pill: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }
  return {
    emoji: "🎯",
    title: "בדרך",
    hint: `עוד ${Math.max(0, SILVER - v)} נקודות למדליית כסף 🥈`,
    pill: "bg-blue-50 text-blue-700 border-blue-100",
  };
}

export default function Stats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [buying, setBuying] = useState(null);

  async function loadStats() {
    console.log("Fetching stats from:", `${API}/user/stats`);
    setErr("");
    setLoading(true);

    const username = localStorage.getItem("username");
    if (!username) {
      setErr("לא נמצא שם משתמש. נא להתחבר מחדש.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/user/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server Invalid JSON: ${text.slice(0, 100)}`);
      }

      if (!res.ok || !data.ok) {
        setErr(data.error || "שגיאה בטעינת הנתונים.");
        setLoading(false);
        return;
      }

      setStats(data.user);
      setLoading(false);
    } catch (error) {
      console.error("Load Stats Error:", error);
      setErr(`שגיאת רשת: ${error.message}`);
      setLoading(false);
    }
  }

  async function buyItem(item) {
    const username = localStorage.getItem("username");
    if (!username) return;

    if (window.confirm(`האם אתה רוצה לקנות ${item.name} ב-${item.cost} נקודות?`)) {
      setBuying(item.id);
      try {
        const res = await fetch(`${API}/shop/buy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, itemCost: item.cost, itemName: item.id })
        });
        const data = await res.json();
        if (data.ok) {
          alert(`תתחדש! קנית ${item.name}`);
          loadStats(); // Reload to update balance
        } else {
          if (data.error === "NOT_ENOUGH_POINTS") alert("אין לך מספיק נקודות 😔");
          else if (data.error === "ALREADY_OWNED") alert("כבר יש לך את זה! 🤓");
          else alert("שגיאה בקנייה: " + data.error);
        }
      } catch (e) {
        alert("שגיאת תקשורת");
      } finally {
        setBuying(null);
      }
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const totalPoints = useMemo(() => {
    if (!stats) return 0;
    return (stats.addition || 0) + (stats.subtraction || 0) + (stats.multiplication || 0) + (stats.division || 0) + (stats.percent || 0);
  }, [stats]);

  const spent = stats?.spentPoints || 0;
  const balance = totalPoints - spent;
  const inventory = stats?.inventory || [];

  const rows = useMemo(() => {
    const s = stats || {};
    return [
      { key: "addition", label: "חיבור", emoji: "➕", value: s.addition ?? 0 },
      { key: "subtraction", label: "חיסור", emoji: "➖", value: s.subtraction ?? 0 },
      { key: "multiplication", label: "כפל", emoji: "✖️", value: s.multiplication ?? 0 },
      { key: "division", label: "חילוק", emoji: "➗", value: s.division ?? 0 },
      { key: "percent", label: "אחוזים", emoji: "％", value: s.percent ?? 0 },
    ];
  }, [stats]);

  const silverCount = rows.filter((r) => r.value >= SILVER).length;
  const goldCount = rows.filter((r) => r.value >= GOLD).length;

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <span>ההישגים שלי</span>
              <span className="text-3xl">🏆</span>
            </h2>
            <p className="mt-2 text-slate-500 font-medium">
              סה"כ נקודות: <span className="font-bold text-blue-600 text-lg">{totalPoints}</span> |
              יתרה לקניות: <span className="font-bold text-emerald-600 text-lg">{balance} 💰</span>
            </p>
          </div>

          <button
            onClick={loadStats}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
          >
            רענן נתונים 🔄
          </button>
        </div>

        {err && (
          <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-medium flex items-center gap-3">
            <span>⚠️</span>
            {err}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium animate-pulse">
            טוען נתונים...
          </div>
        ) : stats ? (
          <div className="grid gap-8">
            {/* Shop Section */}
            <div className="rounded-3xl bg-amber-50 border border-amber-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="text-2xl font-black text-amber-900 mb-4 relative z-10 flex items-center gap-2">
                <span>🛍️</span> חנות ההפתעות
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {SHOP_ITEMS.map(item => {
                  const owned = inventory.includes(item.id);
                  const canBuy = balance >= item.cost;
                  return (
                    <div key={item.id} className={`bg-white p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2 ${owned ? 'border-emerald-200 opacity-80' : 'border-amber-200 shadow-sm hover:scale-105'}`}>
                      <div className="text-4xl mb-2">{item.emoji}</div>
                      <div className="font-bold text-slate-800 text-sm">{item.name}</div>

                      {owned ? (
                        <div className="bg-emerald-100 text-emerald-700 text-xs py-1 px-3 rounded-full font-bold mt-auto">
                          שלך! ✅
                        </div>
                      ) : (
                        <button
                          disabled={!canBuy || buying === item.id}
                          onClick={() => buyItem(item)}
                          className={`mt-auto text-xs py-1.5 px-3 rounded-lg font-bold w-full transition-all ${canBuy ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                          {buying === item.id ? '...' : `קנה ב-${item.cost}`}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Existing Stats Grid */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">המצב שלי במקצועות 📊</h3>
              <div className="grid gap-4 md:grid-cols-1">
                {rows.map((r) => (
                  <ScoreRow key={r.key} {...r} />
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">אין נתונים זמינים.</div>
        )}
      </div>
    </div>
  );
}

function ScoreRow({ label, value, emoji }) {
  const medal = getMedal(value);
  const v = Number(value || 0);
  const max = v >= SILVER ? GOLD : SILVER;
  const progress = Math.min(100, Math.round((v / max) * 100));

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-2xl group-hover:bg-blue-50 transition-colors">
            {emoji}
          </div>
          <div>
            <div className="font-bold text-lg text-slate-800">{label}</div>
            <div className="text-sm font-medium text-slate-500">{medal.hint}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">{v}</div>
          <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${medal.pill}`}>
            {medal.emoji} {medal.title}
          </div>
        </div>
      </div>

      {/* Progress Bar Background */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
