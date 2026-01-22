import React from "react";
import { Link } from "react-router-dom";

export default function AboutMathBuddy() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#020617] font-sans text-slate-200 selection:bg-rose-500/30 selection:text-rose-200 overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-rose-600/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
            MathBuddy<span className="text-white">.</span>
          </div>
          <Link
            to="/"
            className="group relative inline-flex items-center gap-2 rounded-2xl bg-white/5 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
          >
            <span className="group-hover:-translate-x-1 transition-transform">➜</span> חזרה למשחק
          </Link>
        </nav>

        {/* Hero Section */}
        <main className="mx-auto max-w-5xl px-6 pt-12 pb-32">

          <div className="text-center space-y-8 mb-24">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-300 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-fade-in-up">
              <span className="animate-pulse">✨</span> לומדים חשבון אחרת
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-2xl animate-fade-in-up delay-100">
              חשבון זה <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400">פשוט משחק</span>.
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed font-medium animate-fade-in-up delay-200">
              הפכנו את התרגול לחוויה שכל ילד רוצה לחזור אליה. בלי לחץ, בלי שיעמום —
              רק אתגרים מותאמים אישית וחתול אחד חכם שמלווה אתכם בדרך להצלחה. 😺
            </p>
          </div>

          {/* Floating Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32 animate-fade-in-up delay-300">
            <StatCard icon="🚀" label="כיתות" value="א׳ — ו׳" color="rose" />
            <StatCard icon="🎯" label="רמה" value="אישית" color="indigo" />
            <StatCard icon="💎" label="ניקוד" value="חנות ופרסים" color="amber" />
            <StatCard icon="🧠" label="מנוע" value="AI חכם" color="emerald" />
          </div>

          {/* Content Section: Mission & Tech */}
          <div className="grid gap-12 lg:gap-24 md:grid-cols-2 items-center">

            {/* The Mission */}
            <div className="space-y-8 animate-fade-in-right">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                  🚀
                </div>
                <h2 className="text-3xl font-black text-white">המשימה שלנו</h2>
              </div>

              <div className="space-y-6 text-lg text-slate-300 font-medium leading-relaxed">
                <p>
                  אנחנו מאמינים שכל ילד יכול לאהוב מתמטיקה. הסוד הוא לא ב"כישרון", אלא בגישה.
                </p>
                <p>
                  המערכת שלנו היא המאמן האישי החדש שלכם. היא מזהה איפה הילד חזק, ואיפה צריך עוד חיזוק קטן,
                  ובונה מסלול למידה מותאם אישית שמרגיש כמו משחק מחשב, לא כמו שיעורי בית.
                </p>
              </div>

              <ul className="space-y-4 pt-4">
                <Feature text="למידה ללא שיפוטיות" />
                <Feature text="התקדמות בקצב אישי" />
                <Feature text="ביטחון עצמי שנבנה מהצלחות" />
              </ul>
            </div>

            {/* The Tech Card */}
            <div className="relative group animate-fade-in-left">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-[2.5rem] opacity-30 group-hover:opacity-60 blur-xl transition duration-500" />
              <div className="relative rounded-[2rem] bg-[#0f172a]/80 backdrop-blur-xl p-8 md:p-10 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    🤖
                  </div>
                  <h2 className="text-3xl font-black text-white">הטכנולוגיה</h2>
                </div>

                <div className="space-y-8">
                  <TechRow
                    title="בינה מלאכותית"
                    desc="אלגוריתם חכם הלומד את דפוסי התשובות ומתאים את שאלות האתגר הבאות."
                  />
                  <div className="h-px bg-white/5" />
                  <TechRow
                    title="משחוק (Gamification)"
                    desc="מערכת תגמולים מתקדמת: צברו מטבעות, קנו פריטים בחנות ועצבו את הדמות שלכם."
                  />
                  <div className="h-px bg-white/5" />
                  <TechRow
                    title="עיצוב פרימיום"
                    desc="ממשק שתוכנן בקפידה כדי לתת תחושה של משחק איכותי ומהנה."
                  />
                </div>
              </div>
            </div>

          </div>

          {/* CTA Section */}
          <div className="mt-32 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 rounded-full blur-[80px] -z-10" />

            <h3 className="text-slate-400 font-bold text-sm tracking-[0.2em] uppercase mb-8">מוכנים להתחיל?</h3>

            <Link
              to="/"
              className="group relative inline-flex items-center gap-4 rounded-3xl bg-white px-10 py-6 text-2xl font-black text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] active:scale-95"
            >
              <span>🎮</span>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">בואו נשחק</span>
              <div className="absolute inset-0 rounded-3xl ring-2 ring-white/50 group-hover:ring-white transition-all scale-105 opacity-0 group-hover:opacity-100" />
            </Link>

            <p className="mt-12 text-slate-500 font-medium font-mono text-sm">
              Built with ❤️ & 🧠 for the next generation
            </p>
          </div>

        </main>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorStyles = {
    rose: "from-rose-500/20 to-rose-500/5 text-rose-300 border-rose-500/20",
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-300 border-indigo-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300 border-amber-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-500/20",
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${colorStyles[color]} p-6 text-center border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
      <div className="text-4xl mb-4 drop-shadow-md">{icon}</div>
      <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{label}</div>
      <div className="text-xl font-black text-white">{value}</div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <li className="flex items-center gap-4 text-slate-300 font-medium">
      <div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185]" />
      {text}
    </li>
  );
}

function TechRow({ title, desc }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
