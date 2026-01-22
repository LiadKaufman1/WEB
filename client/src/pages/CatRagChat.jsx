import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleGenAI } from "@google/genai";

// example knowledge base
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

// --- helpers ---
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
  // מאפשר גם × ÷
  return s.replace("×", "*").replace("÷", "/");
}

export default function CatRagMini() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const ai = useMemo(() => new GoogleGenAI({ apiKey: API_KEY }), [API_KEY]);

  // prepare knowledge base chunks
  const docs = useMemo(() => {
    //makes chunks from all KB
    const all = KB.join("\n");
    return chunkText(all, 220, 40);
  }, []);

  const vecsRef = useRef([]); // embeddings for docs chunks
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");
  const [answer, setAnswer] = useState("");

  const [exercise, setExercise] = useState("5+5");

  // 1) בונים embeddings פעם אחת (כשנכנסים למסך)
  useEffect(() => {
    (async () => {
      setErr("");
      setAnswer("");

      if (!API_KEY) {
        setErr("חסר VITE_GEMINI_API_KEY ב-.env/.env.local ואז צריך restart ל-vite");
        return;
      }

      try {
        setStatus("Indexing (embeddings)...");
        const emb = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: docs,
        });

        vecsRef.current = emb.embeddings.map((e) => e.values);
        setStatus("ready ✅");
      } catch (e) {
        console.error(e);
        setErr(e?.message || "שגיאה לא ידועה");
        setStatus("failed ❌");
      }
    })();
  }, [API_KEY, ai, docs]);

  async function onAsk() {
    setErr("");
    setAnswer("");

    const q = normalizeExercise(exercise);
    if (!q) {
      setErr("כתוב תרגיל, למשל: 5+5 או 12-3 או 4*6 או 8/2");
      return;
    }
    if (!vecsRef.current.length) {
      setErr("האינדקס עדיין נטען... נסה שוב עוד רגע");
      return;
    }

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
        .sort((a, b) => b.score - a.score)
        .slice(0, 4); // TOP-K

      const context = scored.map((s, idx) => `Source ${idx + 1}: ${s.text}`).join("\n\n");

      setStatus("Generating story...");
const prompt = `
אתה "מתי החתול" שמלמד ילדים חשבון.
תכתוב בעברית פשוטה לילדים.

חוקים חובה:
- בדיוק 3 עד 4 שורות (לא יותר).
- בלי סיכום/מסקנה/״תשובה״ בסוף.
- שורה אחת חייבת לכלול את התרגיל והתוצאה בפורמט: ${q} = <מספר>
- משפט אחד קצר שמסביר מה עושים בפעולה (חיבור/חיסור/כפל/חילוק).
- להשתמש במקורות רק להשראה לסצנה/דוגמה.

מקורות:
${context}

תרגיל: ${q}
`.trim();

      const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      });

      setAnswer(res?.text || "אין טקסט בתגובה");
      setStatus("done ✅");
    } catch (e) {
      console.error(e);
      setErr(e?.message || "שגיאה לא ידועה");
      setStatus("failed ❌");
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif", maxWidth: 720 }}>
      <h2 style={{ marginTop: 0 }}>Cat RAG – מתי החתול 🐱📚</h2>

      <div style={{ marginBottom: 10 }}>
        <b>Status:</b> {status}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="לדוגמה: 5+5"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            fontSize: 16,
          }}
        />
        <button
          onClick={onAsk}
          disabled={status.includes("Indexing")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            cursor: "pointer",
            fontSize: 16,
            opacity: status.includes("Indexing") ? 0.6 : 1,
          }}
        >
          צור סיפור 😺
        </button>
      </div>

      {err ? (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{err}</pre>
      ) : (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            marginTop: 12,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #eee",
            background: "#fafafa",
            minHeight: 140,
          }}
        >
          {answer || "כתוב תרגיל ולחץ 'צור סיפור'..."}
        </pre>
      )}
    </div>
  );
}
