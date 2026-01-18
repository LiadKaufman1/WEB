import { useState } from "react";
import config from "../config";

export default function ParentDashboard() {
    const [password, setPassword] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${config.API_URL}/parents/data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();

            if (data.ok) {
                setUsers(data.users);
                setIsUnlocked(true);
            } else {
                setError("סיסמה שגויה");
            }
        } catch (err) {
            console.error(err);
            setError("שגיאה בחיבור לשרת");
        } finally {
            setLoading(false);
        }
    }

    if (!isUnlocked) {
        return (
            <div className="mx-auto max-w-md mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">מצב הורים 👨‍👩‍👧‍👦</h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="הכנס סיסמה"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-center text-lg tracking-widest"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "בודק..." : "כניסה"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-slate-800">לוח בקרה להורים 📊</h1>
                <button
                    onClick={() => setIsUnlocked(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors"
                >
                    יציאה
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-500 text-sm font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">שם משתמש</th>
                                <th className="px-6 py-4">גיל</th>
                                <th className="px-6 py-4">חיבור</th>
                                <th className="px-6 py-4">חיסור</th>
                                <th className="px-6 py-4">כפל</th>
                                <th className="px-6 py-4">חילוק</th>
                                <th className="px-6 py-4">אחוזים</th>
                                <th className="px-6 py-4">מלאי</th>
                                <th className="px-6 py-4">נקודות שבוזבזו</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">{user.username}</td>
                                    <td className="px-6 py-4 text-slate-600">{user.age}</td>
                                    <td className="px-6 py-4 text-green-600 font-medium">{user.addition || 0}</td>
                                    <td className="px-6 py-4 text-amber-600 font-medium">{user.subtraction || 0}</td>
                                    <td className="px-6 py-4 text-blue-600 font-medium">{user.multiplication || 0}</td>
                                    <td className="px-6 py-4 text-purple-600 font-medium">{user.division || 0}</td>
                                    <td className="px-6 py-4 text-rose-600 font-medium">{user.percent || 0}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {user.inventory?.length > 0 ? user.inventory.join(", ") : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{user.spentPoints || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            לא נמצאו משתמשים במערכת
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
