import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import logo from "../logo.svg";

import CheckTest1 from "./CheckTest1.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Start from "./pages/Start.jsx";

import AdditionPractice from "./pages/AdditionPractice.jsx";
import SubtractionPractice from "./pages/SubtractionPractice.jsx";
import MultiplicationPractice from "./pages/MultiplicationPractice.jsx";
import DivisionPractice from "./pages/DivisionPractice.jsx";
import PracticePercent from "./pages/PracticePercent.jsx";

import CatStory from "./pages/CatStory.jsx";

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
        <div className="text-2xl font-extrabold text-rose-600">אופס! 🐾</div>
        <p className="mt-2 text-slate-700">
          הדף לא נמצא. בדוק את הכתובת או חזור לתפריט למעלה.
        </p>
      </div>
    </div>
  );
}

function Tab({ to, emoji, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold",
          "transition active:scale-[0.98]",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200",
          isActive
            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
            : "bg-white/60 text-slate-700 hover:bg-white hover:text-slate-900 ring-1 ring-slate-200/60",
        ].join(" ")
      }
    >
      <span className="text-base">{emoji}</span>
      <span className="whitespace-nowrap">{children}</span>
    </NavLink>
  );
}

function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "1";
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  if (isLoggedIn()) return <Navigate to="/start" replace />;
  return children;
}

export default function App() {
  const [authed, setAuthed] = useState(() => isLoggedIn());
  const navigate = useNavigate();

  useEffect(() => {
    function onAuthChanged() {
      setAuthed(isLoggedIn());
    }
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, []);

  function handleLogout() {
    if (window.confirm("בטוח שרוצים לצאת? 🚪")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-emerald-50 to-amber-50">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200 blur-3xl" />
        <div className="absolute top-10 -right-24 h-80 w-80 rounded-full bg-emerald-200 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-200 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-6">
        <header className="mb-5">
          <div className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* ✅ לוגו */}
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 ring-1 ring-slate-200 shadow-sm">
                  <img
                    src={logo}
                    alt="Mati the Cat logo"
                    className="h-9 w-9"
                  />
                </div>

                <div className="leading-tight">
                  <div className="text-lg font-black text-slate-900">
                    מתי החתול
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-700">
                      חשבון בקלות
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-600">
                    {authed
                      ? "לומדים בכיף 🐾"
                      : "קודם נכנסים / נרשמים — ואז מתחילים לתרגל 😺"}
                  </div>
                </div>
              </div>
            </div>

            {!authed ? (
              <nav className="flex flex-wrap gap-2">
                <Tab to="/login" emoji="🔐">
                  כניסה
                </Tab>
                <Tab to="/register" emoji="📝">
                  הרשמה
                </Tab>
                <Tab to="/about" emoji="ℹ️">
                  אודות
                </Tab>
              </nav>
            ) : (
              <nav className="flex flex-wrap gap-2">
                <Tab to="/start" emoji="🏠">
                  בית
                </Tab>
                <Tab to="/addition" emoji="➕">
                  חיבור
                </Tab>
                <Tab to="/subtraction" emoji="➖">
                  חיסור
                </Tab>
                <Tab to="/multiplication" emoji="✖️">
                  כפל
                </Tab>
                <Tab to="/division" emoji="➗">
                  חילוק
                </Tab>
                <Tab to="/percent" emoji="📊">
                  אחוזים
                </Tab>
                <Tab to="/about" emoji="ℹ️">
                  אודות
                </Tab>

                {/* 🚪 Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 bg-white/60 text-rose-600 hover:bg-rose-50 hover:text-rose-700 ring-1 ring-rose-200/60"
                >
                  <span className="text-base">🚪</span>
                  <span className="whitespace-nowrap">יציאה</span>
                </button>
              </nav>
            )}
          </div>
        </header>

        <main className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
          <Routes>
            <Route
              path="/"
              element={<Navigate to={authed ? "/start" : "/login"} replace />}
            />

            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <CheckTest1 />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            <Route path="/about" element={<About />} />

            <Route
              path="/start"
              element={
                <ProtectedRoute>
                  <Start />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addition"
              element={
                <ProtectedRoute>
                  <AdditionPractice />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subtraction"
              element={
                <ProtectedRoute>
                  <SubtractionPractice />
                </ProtectedRoute>
              }
            />

            <Route
              path="/multiplication"
              element={
                <ProtectedRoute>
                  <MultiplicationPractice />
                </ProtectedRoute>
              }
            />

            <Route
              path="/division"
              element={
                <ProtectedRoute>
                  <DivisionPractice />
                </ProtectedRoute>
              }
            />

            <Route
              path="/percent"
              element={
                <ProtectedRoute>
                  <PracticePercent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cat-story"
              element={
                <ProtectedRoute>
                  <CatStory />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="mt-6 text-center text-xs font-semibold text-slate-600">
          טיפ: אם טעית — זה בסדר! חתולים לומדים לאט ובטוח 😺
        </footer>
      </div>
    </div>
  );
}
