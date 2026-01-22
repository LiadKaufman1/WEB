import { useState, useEffect } from "react";
import { parentService } from "../services/parent.service";
import { useNavigate } from "react-router-dom";

export default function ParentDashboard() {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createData, setCreateData] = useState({ username: "", password: "", age: "" });
    const [msg, setMsg] = useState("");

    // Load children on mount
    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");

        if (role !== "parent" || !userId) {
            navigate("/login"); // Redirect to login
            return;
        }

        loadChildren(userId);
    }, [navigate]);

    async function loadChildren(parentId) {
        try {
            const data = await parentService.getChildren(parentId);
            if (data.success) {
                setChildren(data.children);
            }
        } catch (e) {
            console.error("Failed to load children", e);
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
                loadChildren(parentId); // Refresh list
            } else {
                setMsg(res.error || "שגיאה ביצירת המשתמש");
            }
        } catch (e) {
            setMsg("שגיאת תקשורת");
        }
    }

    return (
        <div className="mx-auto max-w-5xl p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-slate-800">הילדים שלי 👨‍👩‍👧‍👦</h1>
                <div className="text-sm text-slate-500 font-bold">
                    מחובר כהורה: {localStorage.getItem("username")}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

                {/* Create Child Form */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">הוסף ילד חדש 👶</h3>
                        <form onSubmit={handleCreateChild} className="space-y-3">
                            <input
                                className="w-full p-3 rounded-xl border bg-slate-50"
                                placeholder="שם משתמש לילד"
                                value={createData.username}
                                onChange={e => setCreateData({ ...createData, username: e.target.value })}
                                required
                            />
                            <input
                                className="w-full p-3 rounded-xl border bg-slate-50"
                                placeholder="סיסמה לילד"
                                value={createData.password}
                                onChange={e => setCreateData({ ...createData, password: e.target.value })}
                                required
                            />
                            <input
                                className="w-full p-3 rounded-xl border bg-slate-50"
                                placeholder="גיל"
                                type="number"
                                value={createData.age}
                                onChange={e => setCreateData({ ...createData, age: e.target.value })}
                                required
                            />
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
                                צור משתמש
                            </button>
                            {msg && <div className="text-center text-sm font-bold text-blue-600">{msg}</div>}
                        </form>
                    </div>
                </div>

                {/* Children List */}
                <div className="md:col-span-2 space-y-4">
                    {children.length === 0 ? (
                        <div className="text-center p-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            עדיין לא הוספת ילדים.
                        </div>
                    ) : (
                        children.map(child => (
                            <div key={child._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-lg text-slate-800">{child.username}</div>
                                    <div className="text-xs text-slate-500">גיל: {child.age} | סיסמה: {child.password}</div>
                                </div>
                                <div className="flex gap-4 text-center">
                                    <div>
                                        <div className="text-xs text-slate-400 font-bold">נקודות</div>
                                        <div className="font-black text-blue-600">
                                            {(child.addition || 0) + (child.subtraction || 0) + (child.multiplication || 0) + (child.division || 0) + (child.percent || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
