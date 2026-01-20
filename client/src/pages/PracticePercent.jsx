import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";
import SmartTip from "../components/SmartTip";
import API_URL from "../config";

const PERCENT_STATE_KEY = "percent_practice_state_v2";
const API_BASE = API_URL;

const LEVELS = {
  easy: { label: "קל (קל מאוד)", minBase: 10, maxBase: 200, points: 1 },
  medium: { label: "בינוני (רגיל)", minBase: 10, maxBase: 400, points: 3 },
  hard: { label: "קשה (לילדים)", minBase: 10, maxBase: 600, points: 5 },
};

const LEVEL_TEXT = {
  easy: {
    title: "רמה קלה 😺 (1 נק')",
    body:
      "אחוזים זה 'כמה מתוך 100'.\n" +
      "חישובים סופר קלים:\n" +
      "50% = חצי, 25% = רבע, 10% = לחלק ב־10.\n" +
      "דוגמה: 25% מ־80 = 20.\n" +
      "טיפ של מתי: קודם עושים 10/25/50 ואז ממשיכים 🐾",
  },
  medium: {
    title: "רמה בינונית 🐾 (3 נק')",
    body:
      "עכשיו מוסיפים עוד אחוזים קלים.\n" +
      "5% זה חצי של 10%.\n" +
      "20% זה כפול מ־10%.\n" +
      "דוגמה: 15% מ־200 = 10% (20) + 5% (10) = 30.\n" +
      "טיפ של מתי: תחשוב בחתיכות קטנות 😺",
  },
  hard: {
    title: "רמה קשה 🐯 (5 נק')",
    body:
      "פה עושים אחוזים קצת יותר 'חכמים', אבל עדיין פשוטים.\n" +
      "1% = לחלק ב־100.\n" +
      "2% = פעמיים 1%.\n" +
      "4% = כפול 2%.\n" +
      "דוגמה: 4% מ־200 = 8.\n" +
      "טיפ של מתי: תמיד אפשר לפרק אחוזים לחלקים 🧱",
  },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeQuestion(levelKey) {
  const lvl = levelKey || "easy";

  const PERCENTS_BY_LEVEL = {
    easy: [10, 25, 50],
    medium: [5, 10, 20, 25, 50],
    hard: [1, 2, 4, 5, 10, 20, 25, 50],
  };

  const p = randChoice(PERCENTS_BY_LEVEL[lvl] || PERCENTS_BY_LEVEL.easy);

  const ansRanges = {
    easy: { min: 1, max: 20 },
    medium: { min: 1, max: 40 },
    hard: { min: 1, max: 60 },
  };
  const { min, max } = ansRanges[lvl] || ansRanges.easy;
  const ans = randInt(min, max);

  let base = (ans * 100) / p;

  let tries = 0;
  while (!Number.isInteger(base) && tries < 20) {
    const ans2 = randInt(min, max);
    base = (ans2 * 100) / p;
    tries++;
  }

  if (base > 600) {
    const ansSmall = Math.max(1, Math.floor((600 * p) / 100));
    base = (ansSmall * 100) / p;
    return { p, base, ans: ansSmall };
  }

  return { p, base, ans };
}

export default function PracticePercent() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("easy");
  const [q, setQ] = useState(() => makeQuestion("easy"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [noPointsThisQuestion, setNoPointsThisQuestion] = useState(false);

  function savePracticeState(next = {}) {
    sessionStorage.setItem(
      PERCENT_STATE_KEY,
      JSON.stringify({ level, q, input, msg, noPointsThisQuestion, ...next })
    );
  }

  function clearPracticeState() {
    sessionStorage.removeItem(PERCENT_STATE_KEY);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(PERCENT_STATE_KEY);
    if (saved) {
      try {
        const st = JSON.parse(saved);
        if (st?.level && LEVELS[st.level]) setLevel(st.level);
        if (st?.q) setQ(st.q);
        if (typeof st?.input === "string") setInput(st.input);
        if (typeof st?.msg === "string") setMsg(st.msg);
        if (typeof st?.noPointsThisQuestion === "boolean")
          setNoPointsThisQuestion(st.noPointsThisQuestion);
      } catch {
        // ignore
      }
    }
  }, []);

  function changeLevel(newLevel) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLevel(newLevel);
    goNextQuestion(newLevel);
  }

  function goNextQuestion(nextLevel = level) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearPracticeState();
    setMsg("");
    setInput("");
    setNoPointsThisQuestion(false);
    setQ(makeQuestion(nextLevel));
    savePracticeState({ level: nextLevel, q: makeQuestion(nextLevel), input: "", msg: "" }); // Reset hint implicit
  }

  async function incPercentScoreIfAllowed(isCorrect = true) {
    if (noPointsThisQuestion && isCorrect) return;
    const username = localStorage.getItem("username");
    if (!username) return;

    const points = LEVELS[level]?.points || 1;

    try {
      // DEBUG: Visual Confirmation
      const status = isCorrect ? "SUCCESS" : "FAILURE";

      const res = await fetch(`${API_BASE}/score/percent?t=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, points, isCorrect: !!isCorrect }),
      });
      const data = await res.json();
      setMsg(prev => `${prev} [Client:${status}] [Server:${data.debug?.isSuccess === true ? "ACPT" : "REJ"}]`);
    } catch {
      setMsg(prev => `${prev} [ERR]`);
    }
  }

  function checkAnswer() {
    const val = Number(input);
    if (input.trim() === "" || !Number.isFinite(val)) {
      const m = "אנא הקלד מספר";
      setMsg(m);
      savePracticeState({ msg: m });
      return;
    }

    if (val === q.ans) {
      const earned = LEVELS[level]?.points || 1;
      const m = noPointsThisQuestion
        ? "✅ נכון! (ללא נקודות)"
        : `✅ נכון! הרווחת ${earned} נקודות!`;
      setMsg(m);
      savePracticeState({ msg: m });

      triggerCatFx();
      incPercentScoreIfAllowed(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => goNextQuestion(level), 1500);
      return;
    }

    triggerBadCatFx();
    const m = "❌ טעות, נסה שוב";
    setMsg(m);
    incPercentScoreIfAllowed(false);
    savePracticeState({ msg: m });
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="mx-auto max-w-lg mt-8 px-4">
      <CatCongrats />
      <CatUncongrats />

      <div className="card p-6 md:p-8">
        <h2 className="text-3xl font-black text-slate-900 border-b pb-4 mb-4">תרגול אחוזים ％</h2>

        {/* Level Selection */}
        <div className="grid grid-cols-3 gap-2 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          {Object.keys(LEVELS).map((lvlKey) => (
            <button
              key={lvlKey}
              onClick={() => changeLevel(lvlKey)}
              className={`py-2 rounded-xl text-sm font-bold transition-all ${level === lvlKey
                ? "bg-white text-blue-600 shadow-sm ring-2 ring-blue-100 scale-105"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
            >
              {lvlKey === "easy" ? "קל 😺" : lvlKey === "medium" ? "בינוני 🐾" : "קשה 🐯"}
            </button>
          ))}
        </div>

        {/* Question display */}
        <div className="text-center py-6">
          <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-wide leading-relaxed" dir="rtl">
            כמה זה <span className="text-blue-600">{q.p}%</span> מתוך <span className="text-slate-900">{q.base}</span>?
          </div>
        </div>

        <div className="mb-6">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              savePracticeState({ input: e.target.value });
            }}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            placeholder="?"
            type="number"
            className="w-full text-center text-3xl font-bold py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={checkAnswer}
            className="w-full py-4 text-xl font-bold rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
          >
            בדוק תשובה
          </button>

          <button
            onClick={() => goNextQuestion(level)}
            className="w-full py-3 font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
            title="דלג לתרגיל הבא"
          >
            דלג ➜
          </button>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg animate-bounce-in ${msg.includes("נכון") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
            {msg}
          </div>
        )}

        <div className="mt-6">
          <SmartTip topic="percent" />
        </div>

        {/* Level Info */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
            <span>ℹ️</span> {LEVEL_TEXT[level]?.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {LEVEL_TEXT[level]?.body}
          </p>
        </div>
      </div>
    </div>
  );
}
