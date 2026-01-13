import React, { useEffect, useMemo, useState } from "react";
import API_URL from "../config";

const API = API_URL;

const SILVER = 30;
const GOLD = 60;

function getMedal(value) {
  const v = Number(value || 0);
  if (v >= GOLD) {
    return {
      emoji: "🥇",
      title: "Gold",
      hint: "Outstanding! You are a math champion! 🏆",
      pill: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }
  if (v >= SILVER) {
    return {
      emoji: "🥈",
      title: "Silver",
      hint: "Great job! Keep going for Gold! 🚀",
      pill: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }
  return {
    emoji: "🎯",
    title: "On Track",
    hint: `${Math.max(0, SILVER - v)} more points for Silver 🥈`,
    pill: "bg-blue-50 text-blue-700 border-blue-100",
  };
}

export default function Stats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  async function loadStats() {
    console.log("Fetching stats from:", `${API}/user/stats`);
    setErr("");
    setLoading(true);

    const username = localStorage.getItem("username");
    console.log("Username for stats:", username);

    if (!username) {
      setErr("No username found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/user/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      console.log("Stats Response Status:", res.status);

      const text = await res.text();
      console.log("Stats Response Body:", text); // Debugging

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server Invalid JSON: ${text.slice(0, 100)}`);
      }

      if (!res.ok || !data.ok) {
        setErr(data.error || "Failed to load data.");
        setLoading(false);
        return;
      }

      setStats(data.user);
      setLoading(false);
    } catch (error) {
      console.error("Load Stats Error:", error);
      setErr(`Network Error: ${error.message}`);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const rows = useMemo(() => {
    const s = stats || {};
    return [
      { key: "addition", label: "Addition", emoji: "➕", value: s.addition ?? 0 },
      { key: "subtraction", label: "Subtraction", emoji: "➖", value: s.subtraction ?? 0 },
      { key: "multiplication", label: "Multiplication", emoji: "✖️", value: s.multiplication ?? 0 },
      { key: "division", label: "Division", emoji: "➗", value: s.division ?? 0 },
      { key: "percent", label: "Percent", emoji: "％", value: s.percent ?? 0 },
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
              <span>Achievements</span>
              <span className="text-3xl">🏆</span>
            </h2>
            <p className="mt-2 text-slate-500 font-medium">
              Earn medals in each subject: <span className="font-bold text-slate-700">30pts = Silver</span>, <span className="font-bold text-amber-600">60pts = Gold</span>
            </p>
          </div>

          <button
            onClick={loadStats}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
          >
            Refresh Data 🔄
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
            Loading your progress...
          </div>
        ) : stats ? (
          <div className="grid gap-6">
            {/* Summary Card */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Progress Summary 📊</h3>
              <p className="text-slate-600 leading-relaxed">
                You have collected <b>{silverCount}</b> Silver medals 🥈 and <b>{goldCount}</b> Gold medals 🥇 so far.
                Keep practicing to unlock more!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-1">
              {rows.map((r) => (
                <ScoreRow key={r.key} {...r} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">No data available yet.</div>
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
