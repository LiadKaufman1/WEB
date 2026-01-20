import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import catWelcomeGif from "./assets/CatWelcome.gif";
import API_URL from "./config";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGif, setShowGif] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (showGif) return;
    if (localStorage.getItem("isLoggedIn") === "1") {
      navigate("/start", { replace: true });
    }
  }, [navigate, showGif]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function check(e) {
    if (e?.preventDefault) e.preventDefault();
    if (loading) return;

    if (username.trim() === "" || password.trim() === "") {
      setMsg("נא להזין שם משתמש וסיסמה.");
      return;
    }

    setLoading(true);
    setMsg("מאמת פרטים...");

    try {
      const res = await fetch(`${API_URL}/check-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.error || "שגיאת שרת");
        return;
      }

      if (data.ok) {
        setMsg("התחברות הצליחה! ✅");
        setShowGif(true);

        timerRef.current = setTimeout(() => {
          localStorage.setItem("isLoggedIn", "1");
          localStorage.setItem("username", username);
          window.dispatchEvent(new Event("auth-changed"));
          navigate("/start", { replace: true });
        }, 1500); // 1.5s delay to enjoy the gif
        return;
      }

      setMsg(data.reason === "NO_USER" ? "שם המשתמש אינו קיים ❌" : "סיסמה שגויה ❌");
    } catch (e) {
      console.error(e);
      setMsg("השרת אינו זמין. אנא בדוק את החיבור לאינטרנט.");
    } finally {
      if (!showGif) setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md mt-10">
      <div className="card p-8">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-2">ברוך הבא! 👋</h2>
        <p className="text-center text-slate-500 mb-8 font-medium">הכנס לחשבון כדי להמשיך לתרגל</p>

        <form onSubmit={check} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">שם משתמש</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-right"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="הכנס שם משתמש"
              dir="auto"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">סיסמה</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הכנס סיסמה"
              type="password"
              dir="auto"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "בודק..." : "התחבר 🚀"}
          </button>
        </form>

        {msg && (
          <div className={`mt-6 rounded-xl p-3 text-center font-bold ${msg.includes("הצליחה") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {msg}
          </div>
        )}
      </div>

      {/* Overlay GIF */}
      {showGif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card p-8 text-center animate-bounce-in">
            <img
              src={catWelcomeGif}
              alt="Cat Welcome"
              className="mx-auto rounded-2xl mb-4 shadow-md"
              width={260}
            />
            <div className="text-2xl font-black text-slate-900">ברוך הבא, {username}! 🐱✨</div>
            <div className="text-slate-500 mt-2 font-medium">מכין את הכל...</div>
          </div>
        </div>
      )}
    </div>
  );
}
