// src/pages/CatStory.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import catReadGif from "../assets/cat-read.gif";

const KB = [
  "מתי מצא 5 כדורי צמר ואז עוד 5 כדורי צמר, והוא ספר אותם ביחד.",
  "מתי אסף 7 מדבקות, ואז חבר נתן לו עוד 3 מדבקות.",
  "למתי היו 12 סוכריות והוא נתן 4 לחבר.",
  "למתי היו 9 בלונים, אחד התפוצץ ועוד שניים עפו.",
  "מתי סידר 3 צלחות ובכל צלחת שם 4 עוגיות.",
  "מתי בנה 5 מגדלי לגו ובכל מגדל 2 קוביות.",
  "למתי היו 12 דגים והוא חילק אותם שווה בשווה בין חברים.",
  "למתי היו 10 עפרונות והוא חילק אותם לשני קלמרים.",
  "מתי אוהב לצייר נקודות כדי לראות כמה יש.",
  "מתי בודק מספרים לאט ובסבלנות.",
  "מתי גר בכפר קטן ומשתמש בדברים יומיומיים כדי להסביר חשבון.",
  "מתי מסביר לחברים בעזרת צעצועים ודוגמאות קטנות.",
];

function chunkText(text, size = 220, overlap = 40) {
  const clean = text.trim().replace(/\s+/g, " ");
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    chunks.push(clean.slice(i, i + size));
    i += size - overlap;
  }
  return chunks.filter(Boolean);
}

function cosineSim(a, b) {
  const n = Math.min(a?.length || 0, b?.length || 0);
  if (!n) return -1;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < n; i++) {
    const av = Number(a[i]) || 0;
    const bv = Number(b[i]) || 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

function normalizeExercise(raw) {
  const s = (raw || "").trim().replace(/\s+/g, "");
  return s.replace("×", "*").replace("÷", "/");
}

function opName(op) {
  const O = normalizeExercise(op);
  if (O === "+") return "חיבור";
  if (O === "-") return "חיסור";
  if (O === "*") return "כפל";
  if (O === "/") return "חילוק";
  if (O === "%") return "אחוזים";
  return "פעולה";
}

/**
 * Build a question string + compute expected result.
 * Supports:
 * - arithmetic: { a, b, op: + - * / }
 * - percent:   { p, base, op: "%" } meaning: p% of base
 *
 * Returns:
 * { q, expected, allowedNums[] }
 */
function buildQuestionAndAnswer(state) {
  const O = normalizeExercise(state?.op || "+");

  // Percent mode: p% of base
  if (O === "%") {
    const p = Number(state?.p);
    const base = Number(state?.base);
    if (!Number.isFinite(p) || !Number.isFinite(base)) return null;

    const expected = (base * p) / 100;

    // We keep it kid-friendly: accept only finite numbers.
    if (!Number.isFinite(expected)) return null;

    // Create a compact "q" that our validator can parse reliably.
    // Example: "25%of80"
    const q = `${p}%of${base}`;

    return {
      q,
      expected,
      allowedNums: [p, base, expected],
      mode: "percent",
    };
  }

  // Arithmetic mode: a op b
  const a = Number(state?.a);
  const b = Number(state?.b);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  let expected = null;
  switch (O) {
    case "+":
      expected = a + b;
      break;
    case "-":
      expected = a - b;
      break;
    case "*":
      expected = a * b;
      break;
    case "/":
      if (b === 0) return null;
      expected = a / b;
      break;
    default:
      return null;
  }

  if (!Number.isFinite(expected)) return null;

  const q = normalizeExercise(`${a}${O}${b}`);
  return {
    q,
    expected,
    allowedNums: [a, b, expected],
    mode: "arith",
  };
}

/**
 * Validate that the story:
 * 1) contains the exact mustLine: "q = expected"
 * 2) contains ONLY allowed numbers (no extra numbers)
 * 3) q format is either:
 *    - arith:   "A+B" / "A-B" / "A*B" / "A/B"
 *    - percent: "p%ofbase"
 */
function isValidStory(story, q, expected, allowedNums) {
  if (!story) return false;

  const mustLine = `${q} = ${expected}`;
  if (!story.includes(mustLine)) return false;

  // Extract all numeric tokens from story
  const nums = (story.match(/-?\d+(\.\d+)?/g) || []).map(Number);

  // Validate q format
  const arithOK = /^-?\d+([+\-*/])-?\d+$/.test(q);
  const percentOK = /^-?\d+%of-?\d+$/.test(q);
  if (!arithOK && !percentOK) return false;

  const allowed = new Set((allowedNums || []).map((x) => Number(x)));

  // All numbers in story must be in the allowed set.
  // (This is strict: no dates, no line counts, no extra numbers.)
  return nums.every((n) => allowed.has(n));
}

export default function CatStory() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = useMemo(() => new GoogleGenAI({ apiKey: API_KEY }), [API_KEY]);

  const { state } = useLocation();
  const navigate = useNavigate();

  const docs = useMemo(() => chunkText(KB.join("\n"), 220, 40), []);
  const vecsRef = useRef([]);

  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  const [indexed, setIndexed] = useState(false);
  const didRunRef = useRef(false);

  // 1) Index KB embeddings
  useEffect(() => {
    (async () => {
      setErr("");
      setIndexed(false);

      if (!API_KEY) {
        setErr("חסר VITE_GEMINI_API_KEY ב-.env/.env.local ואז צריך restart ל-vite");
        setStatus("failed ❌");
        return;
      }

      try {
        setStatus("Indexing (embeddings)...");
        const emb = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: docs,
        });

        vecsRef.current = emb.embeddings.map((e) => e.values);
        setIndexed(true);
        setStatus("ready ✅");
      } catch (e) {
        console.error(e);
        setErr(e?.message || "שגיאה לא ידועה");
        setStatus("failed ❌");
      }
    })();
  }, [API_KEY, ai, docs]);

  // 2) Generate story for the received exercise (arith or percent)
  useEffect(() => {
    (async () => {
      if (!indexed) return;
      if (didRunRef.current) return;

      const qa = buildQuestionAndAnswer(state);
      if (!qa) {
        setErr("התרגיל לא תקין (בדוק את הנתונים שנשלחו לדף הסיפור).");
        setStatus("failed ❌");
        return;
      }

      const { q, expected, allowedNums } = qa;

      didRunRef.current = true;

      try {
        setStatus("Embedding question...");
        const qEmb = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: q,
        });

        const qVec = qEmb.embeddings?.[0]?.values;
        if (!qVec) throw new Error("Question embedding missing");

        setStatus("Retrieving context...");
        const scored = docs
          .map((text, i) => ({ text, score: cosineSim(qVec, vecsRef.current[i]) }))
          .sort((x, y) => y.score - x.score)
          .slice(0, 4);

        const context = scored
          .map((s, idx) => `Source ${idx + 1}: ${s.text}`)
          .join("\n\n");

        const mustLine = `${q} = ${expected}`;

        // Helper for nicer Hebrew display inside the prompt
        let exerciseForKids = q;
        if (q.includes("%of")) {
          const mm = q.match(/^(-?\d+)%of(-?\d+)$/);
          if (mm) exerciseForKids = `${mm[1]}% מתוך ${mm[2]}`;
        }

        const onlyNumsText = allowedNums.join(", ");
        const opLabel = opName(state?.op);

        async function generateOnce(strict) {
          const prompt = `
אתה "מתי החתול" שמלמד ילדים חשבון. תכתוב בעברית פשוטה לילדים.

חוקים חובה:
- בדיוק 5 עד 7 שורות.
- בלי סיכום/מסקנה/״תשובה״ בסוף.
- שורה אחת חייבת להיות *בדיוק* כך (כולל רווחים): ${mustLine}
- אל תכתוב שום מספר אחר בטקסט (לא ספרות ולא במילים).
- מותר להופיע רק המספרים האלה: ${onlyNumsText}
- משפט קצר אחד שמסביר מה עושים בפעולה (${opLabel}).

מקורות (רק השראה לסצנה):
${context}

תרגיל: ${exerciseForKids}

${strict ? "אם אתה לא יכול לעמוד בכללים — תחזיר רק 3 שורות לפי הכללים." : ""}
`.trim();

          const res = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            // If your SDK supports it, these help reduce hallucinations:
            // generationConfig: { temperature: 0, topP: 0.1 },
          });

          return res?.text || "";
        }

        setStatus("Generating story...");
        let storyText = await generateOnce(false);

        if (!isValidStory(storyText, q, expected, allowedNums)) {
          storyText = await generateOnce(true);
        }

        // Final fallback: ensure at least the math line is correct
        if (!isValidStory(storyText, q, expected, allowedNums)) {
          const lines = (storyText || "").split("\n").filter(Boolean);
          const fixed = [
            lines[0] || "מתי החתול לומד חשבון עם צעצועים.",
            mustLine,
            lines[2] || "הוא סופר לאט ובודק שלא מתבלבל.",
          ].slice(0, 4);
          storyText = fixed.join("\n");
        }

        sessionStorage.setItem("cat_story_text", storyText);
        sessionStorage.setItem("cat_story_return", "1");
        navigate(-1);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "שגיאה לא ידועה");
        setStatus("failed ❌");
      }
    })();
  }, [indexed, ai, docs, navigate, state]);

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "sans-serif",
        direction: "rtl",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginTop: 0 }}>מתי החתול מכין סיפור... 🐱📚</h2>

      <img
        src={catReadGif}
        alt="מתי החתול קורא"
        style={{
          width: 220,
          maxWidth: "90%",
          margin: "12px auto",
          display: "block",
          borderRadius: 16,
        }}
      />

      {/* Optional: show status for debugging */}
      {/* <div style={{ fontSize: 12, color: "#64748b" }}>{status}</div> */}

      {err ? <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre> : null}

      <p style={{ marginTop: 10, color: "#475569" }}>עוד רגע מחזיר אותך לתרגיל...</p>
    </div>
  );
}
