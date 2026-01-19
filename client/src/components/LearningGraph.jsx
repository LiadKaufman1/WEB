import React, { useMemo } from 'react';

export default function LearningGraph({ history }) {
    const hasHistory = history && history.length > 0;

    const DUMMY_DATA = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            date: d.toLocaleDateString("en-GB").slice(0, 5),
            correct: Math.floor(Math.random() * 10) + 5,
            incorrect: Math.floor(Math.random() * 5)
        };
    });

    const data = hasHistory ? history.slice(-7).map(h => ({
        date: h.date.slice(0, 5), // DD/MM from DD/MM/YYYY
        correct: h.correct || 0,
        incorrect: h.incorrect || 0
    })) : DUMMY_DATA;

    const maxVal = Math.max(
        ...data.map(d => Math.max(d.correct, d.incorrect)),
        10
    );

    const H = 300;
    const PADDING = 40;

    const getY = (val) => H - PADDING - (val / maxVal) * (H - 2 * PADDING);
    // Dynamic X spacing based on width, but we use viewBox for SVG
    // So X can be percentage or relative units
    // Let's assume W=800 for internal coords
    const W = 800;
    const getX = (i) => PADDING + i * ((W - 2 * PADDING) / (data.length - 1 || 1));

    function makePath(key) {
        if (data.length < 2) return "";
        return data.map((d, i) =>
            `${i === 0 ? "M" : "L"} ${getX(i)},${getY(d[key])}`
        ).join(" ");
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">📈 גרף התקדמות <span className="text-sm font-normal text-slate-500">(שבוע אחרון)</span></span>
                {!hasHistory && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-slate-200">מצב הדגמה</span>}
            </h3>

            {!hasHistory && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
                    <div className="bg-white/90 p-4 rounded-2xl shadow-xl border border-blue-100 text-center max-w-sm">
                        <div className="text-4xl mb-2 animate-bounce">👋</div>
                        <div className="font-bold text-slate-800 text-lg">אין עדיין מספיק נתונים</div>
                        <div className="text-sm text-slate-500 mt-1">הנה דוגמה לאיך הגרף יראה כשתתחיל לתרגל!</div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: '300px' }}>
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={PADDING}
                            y1={getY(p * maxVal)}
                            x2={W - PADDING}
                            y2={getY(p * maxVal)}
                            stroke="#f1f5f9"
                            strokeWidth="2"
                        />
                    ))}

                    <text x={PADDING - 10} y={getY(0)} textAnchor="end" fontSize="12" fill="#cbd5e1">0</text>
                    <text x={PADDING - 10} y={getY(maxVal)} textAnchor="end" fontSize="12" fill="#cbd5e1">{Math.round(maxVal)}</text>

                    {/* Lines */}
                    <path d={makePath("correct")} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={makePath("incorrect")} fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={hasHistory ? "0" : "5,5"} opacity={hasHistory ? 1 : 0.6} />

                    {/* Data Points */}
                    {data.map((d, i) => (
                        <g key={i} className="group cursor-pointer">
                            {/* Hover guideline */}
                            <line x1={getX(i)} y1={PADDING} x2={getX(i)} y2={H - PADDING} stroke="#e2e8f0" strokeDasharray="4 4" opacity="0" className="group-hover:opacity-100 transition-opacity" />

                            <circle cx={getX(i)} cy={getY(d.correct)} r="6" fill="#10b981" stroke="white" strokeWidth="3" />
                            <circle cx={getX(i)} cy={getY(d.incorrect)} r="6" fill="#f43f5e" stroke="white" strokeWidth="3" />

                            {/* X Label */}
                            <text x={getX(i)} y={H - 5} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">
                                {d.date}
                            </text>

                            {/* Tooltip */}
                            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <rect x={Math.min(W - 80, Math.max(0, getX(i) - 40))} y={getY(d.correct) - 60} width="80" height="50" rx="8" fill="#1e293b" />
                                <text x={Math.min(W - 80, Math.max(0, getX(i) - 40)) + 40} y={getY(d.correct) - 35} textAnchor="middle" fill="#4ade80" fontSize="14" fontWeight="bold">✓ {d.correct}</text>
                                <text x={Math.min(W - 80, Math.max(0, getX(i) - 40)) + 40} y={getY(d.correct) - 18} textAnchor="middle" fill="#fb7185" fontSize="14" fontWeight="bold">✕ {d.incorrect}</text>
                            </g>
                        </g>
                    ))}
                </svg>
            </div>

            <div className="flex justify-center gap-6 mt-4 pointer-events-none relative z-20">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-bold text-slate-600">תשובות נכונות</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span className="text-sm font-bold text-slate-600">טעויות</span>
                </div>
            </div>
        </div>
    );
}
