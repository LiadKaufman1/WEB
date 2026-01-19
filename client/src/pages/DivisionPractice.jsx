import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCatCongrats from "./useCatCongrats.jsx";
import useCatUncongrats from "./useCatUncongrats.jsx";
import SmartTip from "../components/SmartTip";
import API_URL from "../config";

const DIV_STATE_KEY = "division_practice_state_v2";
const API_BASE = API_URL;

const LEVELS = {
  beginners: { label: "קל (2–5)", minDivisor: 2, maxDivisor: 5, maxAnswer: 10, points: 1 },
  advanced: { label: "בינוני (2–10)", minDivisor: 2, maxDivisor: 10, maxAnswer: 12, points: 3 },
  champs: { label: "קשה (2–12)", minDivisor: 2, maxDivisor: 12, maxAnswer: 15, points: 5 },
};

const LEVEL_TEXT = {
  beginners: {
    title: "רמה קלה 😺 (1 נק')",
    body:
      "מתי החתול מסביר שחילוק זה 'לחלק שווה בשווה'.\n" +
      "לוקחים מספר גדול (עוגיות 🍪).\n" +
      "מחלקים לקבוצות שוות.\n" +
      "סופרים כמה יש בכל קבוצה.\n" +
      "דוגמה: 6 ÷ 2 → 3 לכל ילד.\n" +
      "טיפ של מתי: אפשר לצייר עיגולים ולעשות קבוצות 🟣🟣🟣",
  },
  advanced: {
    title: "רמה בינונית 🐾 (3 נק')",
    body:
      "מתי החתול כבר יודע שחילוק קשור ללוח הכפל.\n" +
      "שואלים: 'איזה מספר כפול המחלק נותן את המחולק?'\n" +
      "דוגמה: 24 ÷ 6 → מי כפול 6 נותן 24? → 4.\n" +
      "אם קשה — נסה כפולות עד שמגיעים למחולק.\n" +
      "טיפ של מתי: לחשוב על כפל עושה חילוק מהיר 🐾",
  },
  champs: {
    title: "רמה קשה 🐯 (5 נק')",
    body:
      "רמה של אלופים אמיתיים.\n" +
      "מתי החתול משתמש בטריקים חכמים ופירוקים.\n" +
      "דוגמה: 96 ÷ 8 → 80 ÷ 8 = 10 וגם 16 ÷ 8 = 2 → ביחד 12.\n" +
      "בודקים עם כפל: 12 × 8 = 96 ✅\n" +
      "טיפ של מתי: בדיקה בכפל שומרת על 0 טעויות 🧠",
  },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(levelKey) {
  const cfg = LEVELS[levelKey] ?? LEVELS.beginners;
  const b = randInt(cfg.minDivisor, cfg.maxDivisor); // divisor
  const ans = randInt(1, cfg.maxAnswer); // keep answer >= 1
  const a = b * ans; // dividend
  return { a, b, ans };
}

export default function PracticeDivision() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("beginners");
  const [q, setQ] = useState(() => makeQuestion("beginners"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [noPointsThisQuestion, setNoPointsThisQuestion] = useState(false);

  function savePracticeState(next = {}) {
    sessionStorage.setItem(
      DIV_STATE_KEY,
      JSON.stringify({ level, q, input, msg, noPointsThisQuestion, ...next })
    );
  }

  function clearPracticeState() {
    sessionStorage.removeItem(DIV_STATE_KEY);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(DIV_STATE_KEY);
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
    savePracticeState({ level: nextLevel, q: makeQuestion(nextLevel), input: "", msg: "" });
  }

  async function incDivisionScoreIfAllowed(isCorrect = true) {
    if (noPointsThisQuestion && isCorrect) return;
    const username = localStorage.getItem("username");
    if (!username) return;

    const points = LEVELS[level]?.points || 1;

    try {
      await fetch(`${API_BASE}/score/division?t=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, points, isCorrect: !!isCorrect }),
      });
    } catch {
      // ignore
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
      incDivisionScoreIfAllowed(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => goNextQuestion(level), 1500);
      return;
    }

    triggerBadCatFx();
    const m = "❌ טעות, נסה שוב";
    setMsg(m);
    incDivisionScoreIfAllowed(false);
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
        <h2 className="text-3xl font-black text-slate-900 border-b pb-4 mb-4">תרגול חילוק ➗</h2>

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
              {lvlKey === "beginners" ? "קל 😺" : lvlKey === "advanced" ? "בינוני 🐾" : "קשה 🐯"}
            </button>
          ))}
        </div>

        {/* Question Display */}
        <div className="text-center py-6" dir="ltr">
          <div className="flex items-center justify-center gap-4 text-5xl md:text-6xl font-black text-slate-800 tracking-wider">
            <span>{q.a}</span>
            <span className="text-blue-500">÷</span>
            <span>{q.b}</span>
            <span>=</span>
          </div>
        </div>

        {/* Answer Input */}
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
          <SmartTip topic="division" />
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
