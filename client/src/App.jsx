import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import logo from "../logo.svg";

import Login from "./Login.jsx";
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
      <div className="card border-rose-200 bg-white p-6 shadow-sm">
        <div className="text-2xl font-extrabold text-rose-600">אופס! 🐾</div>
        <p className="mt-2 text-slate-600">
          הדף לא נמצא. אנא בדוק את הכתובת או חזור לדף הבית.
        </p>
      </div>
    </div>
  );
}

function Tab({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
          "hover:bg-slate-100/80 active:scale-[0.98]",
          isActive
            ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
            : "text-slate-600 hover:text-slate-900",
        ].join(" ")
      }
    >
      <span className="text-lg opacity-80">{icon}</span>
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
    if (window.confirm("האם את/ה בטוח/ה שברצונך להתנתק? 🚪")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen font-sans text-slate-800" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <div className="glass rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                <img src={logo} alt="Logo" className="h-10 w-10" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  החשבון של מתי
                </div>
                <div className="text-sm font-medium text-slate-500">
                  {authed ? "בואו נלמד ביחד! 🚀" : "חשבון בכיף ובצורה מקצועית"}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-2">
              {!authed ? (
                <>
                  <Tab to="/login" icon="🔐">כניסה</Tab>
                  <Tab to="/register" icon="📝">הרשמה</Tab>
                  <Tab to="/about" icon="ℹ️">אודות</Tab>
                </>
              ) : (
                <>
                  <Tab to="/start" icon="🏠">בית</Tab>
                  <Tab to="/addition" icon="➕">חיבור</Tab>
                  <Tab to="/subtraction" icon="➖">חיסור</Tab>
                  <Tab to="/multiplication" icon="✖️">כפל</Tab>
                  <Tab to="/division" icon="➗">חילוק</Tab>
                  <Tab to="/percent" icon="％">אחוזים</Tab>
                  <Tab to="/about" icon="ℹ️">אודות</Tab>

                  <button
                    onClick={handleLogout}
                    className="mr-2 inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 active:scale-95"
                  >
                    <span>יציאה</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="fade-in">
          <Routes>
            <Route path="/" element={<Navigate to={authed ? "/start" : "/login"} replace />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/about" element={<About />} />

            <Route path="/start" element={<ProtectedRoute><Start /></ProtectedRoute>} />
            <Route path="/addition" element={<ProtectedRoute><AdditionPractice /></ProtectedRoute>} />
            <Route path="/subtraction" element={<ProtectedRoute><SubtractionPractice /></ProtectedRoute>} />
            <Route path="/multiplication" element={<ProtectedRoute><MultiplicationPractice /></ProtectedRoute>} />
            <Route path="/division" element={<ProtectedRoute><DivisionPractice /></ProtectedRoute>} />
            <Route path="/percent" element={<ProtectedRoute><PracticePercent /></ProtectedRoute>} />

            <Route path="/cat-story" element={<ProtectedRoute><CatStory /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="mt-12 text-center text-sm font-medium text-slate-400">
          © {new Date().getFullYear()} החשבון של מתי. כל הזכויות שמורות. 🐾
        </footer>
      </div>
    </div>
  );
}
