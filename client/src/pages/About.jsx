import React from "react";
import { Link } from "react-router-dom";

export default function AboutMathBuddy() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-700">

      {/* Navbar Placeholder / Back Button */}
      <nav className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <div className="text-xl font-black text-rose-600 tracking-tight">
          MathBuddy<span className="text-slate-900">.</span>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-rose-600 hover:shadow-md"
        >
          <span>➜</span> חזרה למשחק
        </Link>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-8 animate-fade-in-up">

        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-rose-900 p-8 md:p-16 text-center shadow-2xl shadow-rose-900/20">

          {/* Background Decor */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />

          {/* Badge */}
          <div className="relative mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-rose-200 backdrop-blur-md border border-white/10 mb-8">
            <span>✨</span> לומדים חשבון בחיוך
          </div>

          <h1 className="relative text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl mb-6">
            חשבון זה <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-orange-200">פשוט משחק</span>.
          </h1>

          <p className="relative mx-auto max-w-2xl text-lg text-indigo-100/90 leading-relaxed md:text-xl">
            הקמנו את MathBuddy כדי להפוך את הלימוד לחוויה. בלי לחץ, בלי תסכולים — רק כיף, אתגרים מותאמים אישית, וחתול אחד חכם שמלווה אתכם בכל צעד.
          </p>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 px-4 relative z-10">
          <StatCard icon="👩‍🎓" label="מתאים לכיתות" value="א׳ — ו׳" />
          <StatCard icon="🎯" label="רמת קושי" value="מותאמת אישית" />
          <StatCard icon="🏆" label="שיטת הניקוד" value="תגמול חיובי" />
          <StatCard icon="😺" label="המדריך שלך" value="מתי החתול" />
        </div>

        {/* Content Columns */}
        <div className="mt-16 grid gap-12 md:grid-cols-2">

          {/* Column 1: The Mission */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-xl">🚀</span>
              המשימה שלנו
            </h2>
            <p className="text-lg leading-8 text-slate-600">
              אנחנו מאמינים שכל ילד יכול לאהוב חשבון אם רק ניגשים לזה נכון. המטרה שלנו היא לבנות ביטחון עצמי דרך הצלחות קטנות.
              המערכת שלנו היא לא סתם "מבחן", אלא מאמן אישי שרואה איפה הילד נמצא ומושך אותו קצת למעלה — בדיוק במידה הנכונה.
            </p>

            <ul className="space-y-4 pt-4">
              <FeatureItem text="זיהוי אוטומטי של רמה" />
              <FeatureItem text="חיזוקים חיוביים על מאמץ" />
              <FeatureItem text="גרפיקה נעימה וידידותית" />
            </ul>
          </div>

          {/* Column 2: The Tech */}
          <div className="rounded-3xl bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100/50">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-xl">🤖</span>
              הטכנולוגיה
            </h2>
            <div className="space-y-6">
              <TechBlock
                title="בינה מלאכותית"
                desc="מנתחת את התשובות ומתאימה את השאלות הבאות בזמן אמת."
              />
              <TechBlock
                title="משחוק (Gamification)"
                desc="שימוש באלמנטים של משחק (נקודות, חנות וירטואלית) כדי ליצור מוטיבציה."
              />
              <TechBlock
                title="עיצוב מודרני"
                desc="ממשק נקי ומזמין שמדבר בשפה של הילדים של היום."
              />
            </div>
          </div>

        </div>

        {/* Footer / CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-slate-400 font-bold text-sm tracking-wider uppercase mb-8">מוכנים להתחיל?</h3>
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-xl font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-1 hover:bg-slate-800 hover:shadow-2xl"
          >
            <span>🎯</span> בואו נפתור תרגיל ראשון
          </Link>

          <p className="mt-12 text-slate-400 text-sm font-medium">
            Made with ❤️ & 🧠 for MathBuddy
          </p>
        </div>

      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 text-center shadow-lg shadow-slate-200/50 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-lg font-black text-slate-800 mt-1">{value}</div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <li className="flex items-center gap-3 text-slate-700 font-medium">
      <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
      {text}
    </li>
  );
}

function TechBlock({ title, desc }) {
  return (
    <div className="group">
      <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mt-1">{desc}</p>
    </div>
  );
}
