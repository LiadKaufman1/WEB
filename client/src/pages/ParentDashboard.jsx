import { useState, useEffect } from "react";
import { parentService } from "../services/parent.service";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function ParentDashboard() {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createData, setCreateData] = useState({ username: "", password: "", age: "" });
    const [msg, setMsg] = useState("");
    const [selectedChildId, setSelectedChildId] = useState(null);

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
                // Default select first child for individual view if exists
                if (data.children.length > 0 && !selectedChildId) {
                    setSelectedChildId(data.children[0]._id);
                }
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

    // 1. Comparison Data (Bar Chart) - Each bar is a child, comparing Total Score
    const comparisonData = children.map(child => ({
        name: child.username,
        "ניקוד כללי": (child.addition || 0) + (child.subtraction || 0) + (child.multiplication || 0) + (child.division || 0) + (child.percent || 0),
        "חיבור": child.addition || 0,
        "חיסור": child.subtraction || 0,
        "כפל": child.multiplication || 0,
        "חילוק": child.division || 0,
    }));

    // 2. Individual Data (Radar Chart) for Selected Child
    const selectedChild = children.find(c => c._id === selectedChildId);
    const radarData = selectedChild ? [
        { subject: 'חיבור', A: selectedChild.addition || 0, fullMark: 100 },
        { subject: 'חיסור', A: selectedChild.subtraction || 0, fullMark: 100 },
        { subject: 'כפל', A: selectedChild.multiplication || 0, fullMark: 100 },
        { subject: 'חילוק', A: selectedChild.division || 0, fullMark: 100 },
        { subject: 'אחוזים', A: selectedChild.percent || 0, fullMark: 100 },
    ] : [];

    return (
        <div className="mx-auto max-w-7xl p-6 min-h-screen">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800">לוח בקרה להורים �</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        מחובר כהורה: <span className="text-blue-600">{localStorage.getItem("username")}</span>
                    </p>
                </div>

                {/* Child Quick Select for Radar */}
                {children.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {children.map(child => (
                            <button
                                key={child._id}
                                onClick={() => setSelectedChildId(child._id)}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap
                                    ${selectedChildId === child._id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                            >
                                {child.username}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Section: Graphs & Create Form */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12 animate-slide-in">

                {/* Left: Comparison Graph */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span>🏆</span> השוואת הישגים
                    </h3>
                    <div className="h-[350px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="חיבור" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="חיסור" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="כפל" stackId="a" fill="#3b82f6" />
                                <Bar dataKey="חילוק" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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

            {/* Second Row: Radar Chart & Stats Table */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">

                {/* Radar Chart (Individual Profile) */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center min-h-[400px]">
                    {selectedChild ? (
                        <>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 w-full text-right">
                                הפרופיל של {selectedChild.username}
                            </h3>
                            <div className="h-[300px] w-full" dir="ltr">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                                        <Radar name={selectedChild.username} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center text-sm text-slate-400 font-medium">
                                חוזק יחסי לפי נושאים
                            </div>
                        </>
                    ) : (
                        <div className="text-slate-400 font-medium">בחר ילד כדי לראות פרופיל</div>
                    )}
                </div>

                {/* Detailed Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-xl font-bold text-slate-800">📋 פירוט מלא</h3>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">שם</th>
                                    <th className="px-6 py-4">גיל</th>
                                    <th className="px-6 py-4 text-green-600">חיבור</th>
                                    <th className="px-6 py-4 text-amber-600">חיסור</th>
                                    <th className="px-6 py-4 text-blue-600">כפל</th>
                                    <th className="px-6 py-4 text-purple-600">חילוק</th>
                                    <th className="px-6 py-4 text-rose-600">סה"כ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {children.map((child) => {
                                    const total = (child.addition || 0) + (child.subtraction || 0) + (child.multiplication || 0) + (child.division || 0) + (child.percent || 0);
                                    return (
                                        <tr key={child._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800">{child.username}</td>
                                            <td className="px-6 py-4 text-slate-500">{child.age}</td>
                                            <td className="px-6 py-4 font-medium">{child.addition || 0}</td>
                                            <td className="px-6 py-4 font-medium">{child.subtraction || 0}</td>
                                            <td className="px-6 py-4 font-medium">{child.multiplication || 0}</td>
                                            <td className="px-6 py-4 font-medium">{child.division || 0}</td>
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
        </div>
    );
}
