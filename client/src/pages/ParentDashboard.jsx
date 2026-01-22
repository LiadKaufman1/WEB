import { useState, useEffect } from "react";
import { parentService } from "../services/parent.service";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ParentDashboard() {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createData, setCreateData] = useState({ username: "", password: "", age: "" });
    const [msg, setMsg] = useState("");
    const parentName = localStorage.getItem("username");

    // Initial Load
    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");

        if (role !== "parent" || !userId) {
            navigate("/login");
            return;
        }

        loadChildren(userId);
    }, [navigate]);

    async function loadChildren(parentId) {
        setLoading(true);
        try {
            const data = await parentService.getChildren(parentId);
            if (data.success) {
                setChildren(data.children);
            }
        } catch (e) {
            console.error("Failed to load children", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateChild(e) {
        e.preventDefault();
        setMsg("");

        const parentId = localStorage.getItem("userId");
        if (!parentId) return;

        try {
            const res = await parentService.createChild(parentId, createData);
            if (res.success) {
                setMsg("ילד נוסף בהצלחה! 🎉");
                setCreateData({ username: "", password: "", age: "" });
                loadChildren(parentId);
            } else {
                setMsg(res.error || "שגיאה ביצירת המשתמש");
            }
        } catch (e) {
            setMsg("שגיאת תקשורת");
        }
    }

    // --- Data Preparation for Graphs ---
    const comparisonData = children.map(child => ({
        name: child.username,
        // Correct Answers (Score)
        "חיבור (נכון)": child.addition || 0,
        "חיסור (נכון)": child.subtraction || 0,
        "כפל (נכון)": child.multiplication || 0,
        "חילוק (נכון)": child.division || 0,
        "אחוזים (נכון)": child.percent || 0,

        // Mistakes
        "חיבור (טעות)": child.additionMistakes || 0,
        "חיסור (טעות)": child.subtractionMistakes || 0,
        "כפל (טעות)": child.multiplicationMistakes || 0,
        "חילוק (טעות)": child.divisionMistakes || 0,
        "אחוזים (טעות)": child.percentMistakes || 0,
    }));

    return (
        <div className="mx-auto max-w-7xl p-6 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-5xl font-black text-slate-800 mb-2">
                        ברוך הבא, <span className="text-blue-600">{parentName}</span> 👋
                    </h1>
                    <h2 className="text-xl text-slate-500 font-bold">
                        לוח בקרה וניהול ילדים
                    </h2>
                </div>
            </div>

            {/* Top Section: Graphs & Create Form */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12 animate-slide-in">

                {/* Left: Comparison Graph (Detailed Stacked) */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span>🏆</span> ביצועים מול טעויות
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">עמודה ימנית: הצלחות | עמודה שמאלית: טעויות</p>

                    <div className="h-[400px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc', opacity: 0.5 }}
                                />
                                <Legend iconType="circle" />

                                {/* Stack 1: Correct Answers (Cool Colors) */}
                                <Bar dataKey="חיבור (נכון)" stackId="correct" fill="#10b981" />
                                <Bar dataKey="חיסור (נכון)" stackId="correct" fill="#059669" />
                                <Bar dataKey="כפל (נכון)" stackId="correct" fill="#3b82f6" />
                                <Bar dataKey="חילוק (נכון)" stackId="correct" fill="#6366f1" />
                                <Bar dataKey="אחוזים (נכון)" stackId="correct" fill="#8b5cf6" radius={[4, 4, 0, 0]} />

                                {/* Stack 2: Mistakes (Warm/Red Colors) */}
                                <Bar dataKey="חיבור (טעות)" stackId="mistake" fill="#fca5a5" />
                                <Bar dataKey="חיסור (טעות)" stackId="mistake" fill="#f87171" />
                                <Bar dataKey="כפל (טעות)" stackId="mistake" fill="#ef4444" />
                                <Bar dataKey="חילוק (טעות)" stackId="mistake" fill="#dc2626" />
                                <Bar dataKey="אחוזים (טעות)" stackId="mistake" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Add New Child */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span>👶</span> הוסף ילד חדש
                    </h3>
                    <form onSubmit={handleCreateChild} className="space-y-4 flex-1">
                        <div>
                            <label className="text-sm font-bold text-slate-500 mb-1 block">שם משתמש</label>
                            <input
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none"
                                value={createData.username}
                                onChange={e => setCreateData({ ...createData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-500 mb-1 block">סיסמה</label>
                            <input
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none"
                                value={createData.password}
                                onChange={e => setCreateData({ ...createData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-500 mb-1 block">גיל</label>
                            <input
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none"
                                type="number"
                                value={createData.age}
                                onChange={e => setCreateData({ ...createData, age: e.target.value })}
                                required
                            />
                        </div>
                        <div className="pt-2">
                            <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg shadow-slate-200">
                                צור משתמש
                            </button>
                        </div>
                        {msg && <div className="text-center text-sm font-bold text-blue-600 mt-2">{msg}</div>}
                    </form>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col mb-12">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">📋 טבלת הישגים מפורטת</h3>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">שם</th>
                                <th className="px-6 py-4">גיל</th>
                                <th className="px-6 py-4 text-green-600">חיבור (טעויות)</th>
                                <th className="px-6 py-4 text-amber-600">חיסור (טעויות)</th>
                                <th className="px-6 py-4 text-blue-600">כפל (טעויות)</th>
                                <th className="px-6 py-4 text-purple-600">חילוק (טעויות)</th>
                                <th className="px-6 py-4 text-rose-600">סה"כ נקודות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {children.map((child) => {
                                const total = (child.addition || 0) + (child.subtraction || 0) + (child.multiplication || 0) + (child.division || 0) + (child.percent || 0);
                                return (
                                    <tr key={child._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{child.username}</td>
                                        <td className="px-6 py-4 text-slate-500">{child.age}</td>
                                        <td className="px-6 py-4 font-medium">
                                            {child.addition || 0} <span className="text-rose-400 text-xs">({child.additionMistakes || 0})</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {child.subtraction || 0} <span className="text-rose-400 text-xs">({child.subtractionMistakes || 0})</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {child.multiplication || 0} <span className="text-rose-400 text-xs">({child.multiplicationMistakes || 0})</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {child.division || 0} <span className="text-rose-400 text-xs">({child.divisionMistakes || 0})</span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-800">{total}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {children.length === 0 && (
                        <div className="p-10 text-center text-slate-400">
                            עדיין אין נתונים להצגה
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
