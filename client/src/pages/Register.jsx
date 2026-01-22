import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 4 || ageNum > 16) {
      setMsg("הגיל חייב להיות בין 4 ל-16");
      setLoading(false);
      return;
    }

    try {
      const data = await authService.register(username, password, ageNum);

      if (!data.success) {
        setMsg(data.error || "ההרשמה נכשלה. נסה שם משתמש אחר.");
        setLoading(false);
        return;
      }

      // Auto-save username for convenience
      localStorage.setItem("username", username);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMsg("השרת לא זמין. נסה שוב מאוחר יותר.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md mt-10">
      <div className="card p-8">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-2">הצטרף לכיף! 📝</h2>
        <p className="text-center text-slate-500 mb-8 font-medium">צור חשבון חדש כדי לאסוף מדליות</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">שם משתמש</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-right"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="בחר שם משתמש"
              required
              dir="auto"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">סיסמה</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="בחר סיסמה סודית"
              type="password"
              required
              dir="auto"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">גיל</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-right"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="בן/בת כמה את/ה? (4-16)"
              type="number"
              min="4"
              max="16"
              required
              dir="auto"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? "יוצר חשבון..." : "צור חשבון ✨"}
          </button>
        </form>

        {msg && (
          <div className="mt-6 rounded-xl bg-rose-50 p-3 text-center font-bold text-rose-600 border border-rose-200">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
