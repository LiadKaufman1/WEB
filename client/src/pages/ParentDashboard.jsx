import { useState, useEffect } from "react";
import { parentService } from "../services/parent.service";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#2563eb', '#db2777', '#16a34a', '#8b5cf6', '#ea580c', '#0891b2', '#ca8a04', '#dc2626'];

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

    // --- Data Preparation for Percentage Chart ---
    // X-Axis = Subjects
    // Bars = Success Percentage
    const subjects = [
        { key: 'addition', label: 'חיבור' },
        { key: 'subtraction', label: 'חיסור' },
        { key: 'multiplication', label: 'כפל' },
        { key: 'division', label: 'חילוק' },
        { key: 'percent', label: 'אחוזים' }
    ];

    const chartData = subjects.map(subj => {
        const entry = { name: subj.label };
        children.forEach(child => {
            const correct = child[subj.key] || 0;
            const mistakes = child[`${subj.key}Mistakes`] || 0;
            const total = correct + mistakes;

            // Calculate Percentage (avoid NaN)
            const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

            // Store percentage for the bar height
            entry[child.username] = percentage;

            // Store details for tooltip
            entry[`${child.username}_details`] = { correct, mistakes, total };
        });
        return entry;
    });

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-right" dir="rtl">
                    <p className="font-bold text-slate-800 mb-2 underline decoration-blue-200 decoration-2 underline-offset-4">{label}</p>
                    {payload.map((entry, index) => {
                        const childName = entry.dataKey;
                        const details = entry.payload[`${childName}_details`];
                        return (
                            <div key={index} className="mb-2 last:mb-0">
                                <p style={{ color: entry.fill }} className="text-sm font-black flex justify-between gap-4">
                                    <span>{childName}</span>
                                    <span>{entry.value}%</span>
                                </p>
                                <p className="text-xs text-slate-500 font-medium">
                                    {details.correct} נכונות | {details.mistakes} טעויות
                                </p>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

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

                {/* Left: Percentage Graph */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span>🎯</span> אחוזי הצלחה
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">מציג את הדיוק של כל ילד (נכון מול טעויות)</p>

                    <div className="h-[400px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 100]}
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" />

                                {children.map((child, index) => (
                                    <Bar
                                        key={child._id}
                                        dataKey={child.username}
                                        fill={COLORS[index % COLORS.length]}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={50}
                                    />
                                ))}
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
