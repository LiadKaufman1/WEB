import React, { useMemo } from 'react';

export default function LearningGraph({ history }) {
    const data = useMemo(() => {
        if (!history || history.length === 0) return [];
        // Slice last 7 days
        return history.slice(-7);
    }, [history]);

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center h-64">
                <div className="text-center text-slate-400">
                    <div className="text-4xl mb-2">📉</div>
                    <div>פתור תרגילים היום כדי לראות את גרף ההתקדמות!</div>
                </div>
            </div>
        );
    }

    // Find Max for scaling
    const maxVal = Math.max(
        ...data.map(d => Math.max(d.correct || 0, d.incorrect || 0)),
        5 // Minimum scale
    ) * 1.2;

    const width = 600;
    const height = 300;
    const padding = 40;

    const getX = (index) => padding + (index / Math.max(1, data.length - 1)) * (width - 2 * padding);
    const getY = (val) => height - padding - (val / maxVal) * (height - 2 * padding);

    const correctPoints = data.map((d, i) => `${getX(i)},${getY(d.correct || 0)}`).join(" ");
    const incorrectPoints = data.map((d, i) => `${getX(i)},${getY(d.incorrect || 0)}`).join(" ");

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span>📈</span> ביצועים יומיים
                </h3>
                <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div> תשובות נכונות
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div> טעויות
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px]">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                        const y = getY(t * maxVal);
                        return (
                            <line key={t} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="2" />
                        )
                    })}

                    {/* Incorrect Line */}
                    <polyline
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3"
                        points={incorrectPoints}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.8"
                    />

                    {/* Correct Line */}
                    <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        points={correctPoints}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {data.map((d, i) => (
                        <g key={i} className="group cursor-pointer">
                            {/* Incorrect Dot */}
                            <circle cx={getX(i)} cy={getY(d.incorrect || 0)} r="4" fill="#f43f5e" />
                            {/* Correct Dot */}
                            <circle cx={getX(i)} cy={getY(d.correct || 0)} r="5" fill="#10b981" stroke="white" strokeWidth="2" />

                            {/* Tooltip */}
                            <g className="invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100">
                                <rect x={getX(i) - 40} y={getY(d.correct || 0) - 55} width="80" height="45" rx="5" fill="#1e293b" />
                                <text x={getX(i)} y={getY(d.correct || 0) - 35} textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="bold">✓ {d.correct}</text>
                                <text x={getX(i)} y={getY(d.correct || 0) - 20} textAnchor="middle" fill="#fb7185" fontSize="11" fontWeight="bold">✗ {d.incorrect}</text>
                            </g>

                            {/* Date Label */}
                            <text x={getX(i)} y={height - 15} textAnchor="middle" fill="#94a3b8" fontSize="10">{d.date?.split('/')[0]}/{d.date?.split('/')[1]}</text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}
