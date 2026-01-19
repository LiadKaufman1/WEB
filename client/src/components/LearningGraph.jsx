import React, { useMemo } from 'react';

export default function LearningGraph({ history }) {
    // Mock data if no history yet
    const data = useMemo(() => {
        if (!history || history.length === 0) return [];

        // Take last 20 points to avoid overcrowding
        const relevant = history.slice(-20);

        // Normalize data for SVG
        return relevant.map(entry => ({
            date: new Date(entry.date).toLocaleDateString("he-IL", { day: '2-digit', month: '2-digit' }),
            score: entry.score
        }));
    }, [history]);

    if (data.length < 2) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center h-64">
                <div className="text-center text-slate-400">
                    <div className="text-4xl mb-2">📉</div>
                    <div>פתור עוד תרגילים כדי לראות את גרף ההתקדמות!</div>
                </div>
            </div>
        );
    }

    // --- SVG Logic ---
    const width = 600;
    const height = 300;
    const padding = 40;

    const maxScore = Math.max(...data.map(d => d.score)) * 1.1; // +10% padding
    const minScore = Math.min(...data.map(d => d.score)) * 0.9;

    // X Scale: index -> pixel
    const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);

    // Y Scale: score -> pixel
    const getY = (score) => height - padding - ((score - minScore) / (maxScore - minScore)) * (height - 2 * padding);

    const points = data.map((d, i) => `${getX(i)},${getY(d.score)}`).join(" ");

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📈</span> קצב הלמידה שלי
            </h3>

            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px]">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                        const y = getY(minScore + t * (maxScore - minScore));
                        return (
                            <line key={t} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="2" />
                        )
                    })}

                    {/* The Line */}
                    <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        points={points}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Dots & Tooltips */}
                    {data.map((d, i) => (
                        <g key={i} className="group">
                            <circle cx={getX(i)} cy={getY(d.score)} r="5" fill="white" stroke="#3b82f6" strokeWidth="3" className="transition-all group-hover:r-7" />

                            {/* Label on Hover */}
                            <g className="invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100">
                                <rect x={getX(i) - 30} y={getY(d.score) - 40} width="60" height="25" rx="5" fill="#1e293b" />
                                <text x={getX(i)} y={getY(d.score) - 23} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.score} נק'</text>
                            </g>

                            {/* Date Label on X Axis */}
                            <text x={getX(i)} y={height - 10} textAnchor="middle" fill="#94a3b8" fontSize="10">{d.date}</text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}
