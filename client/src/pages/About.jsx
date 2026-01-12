// src/pages/AboutMathBuddy.jsx
import React from "react";

export default function AboutMathBuddy() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      {/* HERO */}
      <header className="mx-auto max-w-5xl px-4 pt-10 pb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Text */}
            <div className="md:flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                🐾 אתר ללימוד חשבון לגילאי 6–12
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                לומדים חשבון עם{" "}
                <span className="text-rose-600">מתי החתול</span> 😺
              </h1>

              <p className="mt-3 text-base leading-7 text-slate-700 md:text-lg">
                זה אתר שעוזר לילדים ללמוד חשבון בצורה כיפית, קצרה וברורה — עם
                בינה מלאכותית שמלווה אותם דרך <b>מתי החתול</b>. המערכת בודקת איך
                הילד מתקדם, ואז <b>מתאימה את הרמה</b>: אם קל מדי היא מאתגרת יותר,
                ואם קשה מדי היא מסבירה ומפשטת כדי לבנות ביטחון.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Chip>➕ חיבור</Chip>
                <Chip>➖ חיסור</Chip>
                <Chip>✖️ כפל</Chip>
                <Chip>➗ חילוק</Chip>
                <Chip>📊 אחוזים</Chip>
              </div>

              <div className="mt-6">
                <a
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  להתחיל לתרגל 🚀
                </a>
              </div>
            </div>

            {/* “Cat” card without image */}
            <div className="md:w-[340px]">
              <div className="rounded-3xl border border-rose-100 bg-gradient-to-b from-rose-50 to-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-rose-700">
                      הבינה המלאכותית שמלווה אותך
                    </div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-900">
                      מתי החתול 😺
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-1 text-lg shadow-sm">
                    🐾
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/80 p-4 text-center text-sm font-semibold text-slate-700">
                  “אני מתאים לך את הרמה — כדי שתתקדם בלי לחץ!” 😸
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <MiniStat label="תרגול קצר" value="5 דק׳" />
                  <MiniStat label="AI מלווה" value="בכל שאלה" />
                  <MiniStat label="רמה משתנה" value="לפי התקדמות" />
                  <MiniStat label="כיף" value="ממש!" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-5xl px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            title="✨ למה זה עוזר לילדים?"
            icon="🧠"
            items={[
              "מתי החתול מלווה את הילד ומסביר בצורה ידידותית.",
              "המערכת מתאימה את הקושי לפי ההתקדמות (לא קל מדי ולא קשה מדי).",
              "תרגול משחקי שומר על עניין וריכוז לאורך זמן.",
              "חיזוקים חיוביים אחרי הצלחות מעלים מוטיבציה.",
              "הסברים פשוטים שמתאימים לגילאי 6–12.",
            ]}
          />

          <Card
            title="👨‍👩‍👧 למה זה טוב גם להורים?"
            icon="💙"
            items={[
              "רואים התקדמות אמיתית לאורך זמן.",
              "הילד מתרגל לבד עם תחושת הצלחה.",
              "פחות מאבקים סביב שיעורי בית.",
              "יותר ביטחון עצמי וחיבור למתמטיקה.",
              "תרגול עקבי בונה בסיס מצוין להמשך.",
            ]}
          />
        </div>

        {/* How it works */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🎮</div>
            <h2 className="text-xl font-extrabold text-slate-900">
              איך זה עובד בפועל?
            </h2>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Step
              n="1"
              title="עונים על שאלות"
              body="בוחרים נושא (חיבור/חיסור/כפל/חילוק/אחוזים) ומתחילים."
            />
            <Step
              n="2"
              title="מתי החתול עוזר"
              body="אם טעית — מתי מסביר ומדגים. אם הצלחת — הוא מאתגר קצת יותר."
            />
            <Step
              n="3"
              title="הרמה משתנה לבד"
              body="המערכת לומדת איך הילד מתקדם ומכוונת את הקושי בהתאם."
            />
          </div>
        </section>

        {/* Big message */}
        <section className="mt-6 rounded-3xl border border-rose-100 bg-rose-50 p-6">
          <h3 className="text-lg font-extrabold text-rose-700">
            😺 מתי החתול אומר:
          </h3>
          <p className="mt-2 text-base leading-7 text-slate-800">
            “לא חייבים להיות מושלמים — חייבים להתאמן. ואני אדאג שהרמה תהיה בדיוק
            מה שמתאים לך!” 💪
          </p>
        </section>
      </main>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Card({ title, icon, items }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="text-2xl">{icon}</div>
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
      </div>
      <ul className="mt-4 space-y-2 text-slate-700">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 leading-7">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Step({ n, title, body }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-lg font-extrabold text-white">
          {n}
        </div>
        <div className="font-extrabold text-slate-900">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
