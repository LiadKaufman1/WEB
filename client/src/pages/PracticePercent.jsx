import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";
import API_URL from "../config";

const PERCENT_STATE_KEY = "percent_practice_state_v1";
const API_BASE = API_URL;

const LEVELS = {
  easy: { label: "Beginner (Very Easy)", minBase: 10, maxBase: 200 },
  medium: { label: "Advanced (Easy)", minBase: 10, maxBase: 400 },
  hard: { label: "Expert (Kid Friendly)", minBase: 10, maxBase: 600 },
};

const LEVEL_TEXT = {
  easy: {
    title: "Level 1: Beginner 😺",
    body:
      "Percent means 'out of 100'.\n" +
      "Super easy calculations:\n" +
      "50% = half, 25% = quarter, 10% = divide by 10.\n" +
      "Example: 25% of 80 = 20.\n" +
      "Cat Tip: Try 10/25/50 first, then continue! 🐾",
  },
  medium: {
    title: "Level 2: Advanced 🐾",
    body:
      "Now we add some easy percents.\n" +
      "5% is half of 10%.\n" +
      "20% is double 10%.\n" +
      "Example: 15% of 200 = 10% (20) + 5% (10) = 30.\n" +
      "Cat Tip: Think in small pieces! 😺",
  },
  hard: {
    title: "Level 3: Expert 🐯",
    body:
      "A bit smarter percents here but still simple.\n" +
      "1% = divide by 100.\n" +
      "2% = twice 1%.\n" +
      "4% = double 2%.\n" +
      "Example: 4% of 200 = 8.\n" +
      "Cat Tip: You can always break percents down! 🧱",
  },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function levelFromPercentF(percent_f) {
  const n = Number(percent_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "easy";
  if (n === 2) return "medium";
  return "hard";
}

async function fetchPercentF(username) {
  try {
    const res = await fetch(
      `${API_BASE}/user/percent-f?username=${encodeURIComponent(username)}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) return null;
    const n = Number(data.percent_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
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
  const [story, setStory] = useState("");
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
        if (st?.level) setLevel(st.level);
        if (st?.q) setQ(st.q);
        if (typeof st?.input === "string") setInput(st.input);
        if (typeof st?.msg === "string") setMsg(st.msg);
        if (typeof st?.noPointsThisQuestion === "boolean")
          setNoPointsThisQuestion(st.noPointsThisQuestion);
      } catch {
        // ignore
      }
    }

    const s = sessionStorage.getItem("cat_story_text");
    if (s) {
      setStory(s);
      sessionStorage.removeItem("cat_story_text");
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (sessionStorage.getItem(PERCENT_STATE_KEY)) return;
      const username = localStorage.getItem("username");
      if (!username) return;
      const f = await fetchPercentF(username);
      const newLevel = levelFromPercentF(f);
      setLevel(newLevel);
      setQ(makeQuestion(newLevel));
      setInput("");
      setMsg("");
      setNoPointsThisQuestion(false);
    })();
  }, []);

  function goNextQuestion(nextLevel = level) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearPracticeState();
    setStory("");
    sessionStorage.removeItem("cat_story_text");
    setMsg("");
    setInput("");
    setNoPointsThisQuestion(false);
    setQ(makeQuestion(nextLevel));
  }

  function goStory() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNoPointsThisQuestion(true);
    savePracticeState({ noPointsThisQuestion: true });
    navigate("/cat-story", { state: { p: q.p, base: q.base, op: "%" } });
  }

  async function incPercentScoreIfAllowed() {
    if (noPointsThisQuestion) return;
    const username = localStorage.getItem("username");
    if (!username) return;
    try {
      await fetch(`${API_BASE}/score/percent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
    } catch {
      // ignore
    }
  }

  function checkAnswer() {
    const val = Number(input);
    if (input.trim() === "" || !Number.isFinite(val)) {
      const m = "Please type a number";
      setMsg(m);
      savePracticeState({ msg: m });
      return;
    }

    if (val === q.ans) {
      const m = noPointsThisQuestion
        ? "✅ Correct! (No points because you used a story)"
        : "✅ Correct!";
      setMsg(m);
      savePracticeState({ msg: m });

      triggerCatFx();
      incPercentScoreIfAllowed();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => goNextQuestion(level), 1000);
      return;
    }

    triggerBadCatFx();
    const m = "❌ Incorrect, try again";
    setMsg(m);
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
        <h2 className="text-3xl font-black text-slate-900 border-b pb-4 mb-4">Percent Practice ％</h2>

        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100 mb-6">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Current Level</span>
          <span className="text-lg font-extrabold text-blue-600">
            {level === "easy" ? "Beginner 😺" : level === "medium" ? "Advanced 🐾" : "Expert 🐯"}
          </span>
        </div>

        {/* Question display */}
        <div className="text-center py-6">
          <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-wide leading-relaxed">
            How much is <span className="text-blue-600">{q.p}%</span> of <span className="text-slate-900">{q.base}</span>?
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
            Check Answer
          </button>

          <div className="flex gap-3">
            <button
              onClick={goStory}
              className="flex-1 py-3 font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              title="Mati will tell a story about this problem"
            >
              Tell a Story 📖
            </button>
            <button
              onClick={() => goNextQuestion(level)}
              className="flex-1 py-3 font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              title="Skip to next question"
            >
              Skip ➜
            </button>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg animate-bounce-in ${msg.includes("Correct") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
            {msg}
          </div>
        )}

        {/* Level Info */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
            <span>ℹ️</span> {LEVEL_TEXT[level]?.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {LEVEL_TEXT[level]?.body}
          </p>
        </div>

        {/* Story Display */}
        {story && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h3 className="font-black text-amber-800 mb-2">Mati's Story 😺</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm text-amber-900 leading-relaxed">
              {story}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
