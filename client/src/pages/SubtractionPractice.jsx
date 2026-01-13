import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";
import API_URL from "../config";

const SUB_STATE_KEY = "subtraction_practice_state_v1";
const API_BASE = API_URL;

const LEVELS = {
  easy: { label: "Beginner (0–10)", min: 0, max: 10 },
  medium: { label: "Advanced (0–50)", min: 0, max: 50 },
  hard: { label: "Expert (0–200)", min: 0, max: 200 },
};

const LEVEL_TEXT = {
  easy: {
    title: "Level 1: Easy 😺",
    body:
      "Here we learn subtraction calmly and clearly.\n" +
      "Start with the big number.\n" +
      "Count backwards for the second number.\n" +
      "Example: 5 − 2 → 4, 3.\n" +
      "Cat Tip: Subtracting 0 changes nothing! 😸",
  },
  medium: {
    title: "Level 2: Medium 🐾",
    body:
      "Time for a clever subtraction trick.\n" +
      "Instead of counting many steps back, reach a round number first.\n" +
      "Then subtract the rest.\n" +
      "Example: 34 − 6 → 30, then 28.\n" +
      "Cat Tip: Round numbers make subtraction easy! 🐾",
  },
  hard: {
    title: "Level 3: Hard 🐯",
    body:
      "For cats who have mastered the basics.\n" +
      "Break down the number you are subtracting.\n" +
      "Subtract tens first, then the ones.\n" +
      "Example: 146 − 37 → 116, then 109.\n" +
      "Cat Tip: Breaking it down is the secret to smart math! 🧠",
  },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(levelKey) {
  const { min, max } = LEVELS[levelKey] ?? LEVELS.easy;
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (a < b) [a, b] = [b, a]; // Ensure non-negative result
  return { a, b, ans: a - b };
}

function levelFromSubtractionF(subtraction_f) {
  const n = Number(subtraction_f ?? 1);
  if (!Number.isFinite(n) || n <= 1) return "easy";
  if (n === 2) return "medium";
  return "hard";
}

async function fetchSubtractionF(username) {
  try {
    const res = await fetch(
      `${API_BASE}/user/subtraction-f?username=${encodeURIComponent(username)}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) return null;
    const n = Number(data.subtraction_f);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export default function PracticeSubtraction() {
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
      SUB_STATE_KEY,
      JSON.stringify({ level, q, input, msg, noPointsThisQuestion, ...next })
    );
  }

  function clearPracticeState() {
    sessionStorage.removeItem(SUB_STATE_KEY);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(SUB_STATE_KEY);
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
      if (sessionStorage.getItem(SUB_STATE_KEY)) return;
      const username = localStorage.getItem("username");
      if (!username) return;
      const f = await fetchSubtractionF(username);
      const newLevel = levelFromSubtractionF(f);
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
    navigate("/cat-story", { state: { a: q.a, b: q.b, op: "-" } });
  }

  async function incSubtractionScoreIfAllowed() {
    if (noPointsThisQuestion) return;
    const username = localStorage.getItem("username");
    if (!username) return;
    try {
      await fetch(`${API_BASE}/score/subtraction`, {
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
      incSubtractionScoreIfAllowed();

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
        <h2 className="text-3xl font-black text-slate-900 border-b pb-4 mb-4">Subtraction Practice ➖</h2>

        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100 mb-6">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Current Level</span>
          <span className="text-lg font-extrabold text-blue-600">
            {level === "easy" ? "Beginner 😺" : level === "medium" ? "Advanced 🐾" : "Expert 🐯"}
          </span>
        </div>

        {/* Question Display */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-4 text-5xl md:text-6xl font-black text-slate-800 tracking-wider">
            <span>{q.a}</span>
            <span className="text-blue-500">−</span>
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
