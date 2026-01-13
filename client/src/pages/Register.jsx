import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

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
      setMsg("Age must be between 4 and 16");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, age: ageNum }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setMsg(data.error || "Registration Failed. Try a different username.");
        setLoading(false);
        return;
      }

      // Auto-save username for convenience
      localStorage.setItem("username", username);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMsg("Server unavailable. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md mt-10">
      <div className="card p-8">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-2">Join the Fun! 📝</h2>
        <p className="text-center text-slate-500 mb-8 font-medium">Create a new account to start earning medals</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a secret password"
              type="password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Age</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="How old are you? (4-16)"
              type="number"
              min="4"
              max="16"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account ✨"}
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
