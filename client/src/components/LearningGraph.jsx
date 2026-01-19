import React, { useMemo } from 'react';

export default function LearningGraph({ stats }) {
    // If no stats provided passed yet, show empty or loading
    // We expect the full user object now as 'stats' prop, or we map it in Start.jsx

    // Fallback if stats is just history array (old usage) -> we need the full user object to show per-topic stats.
    // So Start.jsx must pass the whole 'stats' object to this component.

    // Mapping keys to labels
    const TOPICS = [
        { key: "addition", label: "חיבור" },
        { key: "subtraction", label: "חיסור" },
        { key: "multiplication", label: "כפל" },
        { key: "division", label: "חילוק" },
        { key: "percent", label: "אחוזים" },
    ];

    const data = TOPICS.map(t => ({
        label: t.label,
        correct: stats?.[t.key] || 0,
        incorrect: stats?.[`${t.key}_fail`] || 0
    }));

    // Find max value for scaling
    // We want to leave some headroom
    const maxVal = Math.max(
        ...data.map(d => Math.max(d.correct, d.incorrect)),
        10
    );

    // Dimensions
    const H = 300;
    const padding = 50;
    const barWidth = 30; // Width of each bar
    const gap = 10; // Gap between correct/incorrect bars of same topic
    const groupGap = 60; // Gap between topics

    // Calculate total width based on number of items
    // (bar + gap + bar) + groupGap
    // We can use SVG viewBox to scale it to container
    const chartWidth = padding * 2 + TOPICS.length * ((barWidth * 2 + gap) + groupGap);

    const getY = (val) => H - padding - (val / maxVal) * (H - 2 * padding);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">📊 ביצועים לפי נושא</span>
            </h3>

            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${H}`} className="w-full min-w-[500px]" style={{ maxHeight: '350px' }}>
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={padding}
                            y1={getY(p * maxVal)}
                            x2={chartWidth - padding}
                            y2={getY(p * maxVal)}
                            stroke="#f1f5f9"
                            strokeWidth="2"
                        />
                    ))}

                    {/* Y Axis Labels */}
                    <text x={padding - 10} y={getY(0)} textAnchor="end" fontSize="14" fill="#cbd5e1">0</text>
                    <text x={padding - 10} y={getY(maxVal)} textAnchor="end" fontSize="14" fill="#cbd5e1">{Math.ceil(maxVal)}</text>

                    {data.map((d, i) => {
                        const groupX = padding + i * ((barWidth * 2 + gap) + groupGap);
                        const correctH = (H - 2 * padding) * (d.correct / maxVal);
                        const incorrectH = (H - 2 * padding) * (d.incorrect / maxVal);

                        return (
                            <g key={i}>
                                {/* Label */}
                                <text x={groupX + barWidth + gap / 2} y={H - 15} textAnchor="middle" fill="#64748b" fontWeight="bold" fontSize="14">
                                    {d.label}
                                </text>

                                {/* Correct Bar (Green) */}
                                <rect
                                    x={groupX}
                                    y={getY(d.correct)}
                                    width={barWidth}
                                    height={correctH}
                                    fill="#10b981"
                                    rx="4"
                                    className="hover:opacity-80 transition-opacity"
                                />
                                {d.correct > 0 && <text x={groupX + barWidth / 2} y={getY(d.correct) - 5} textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">{d.correct}</text>}

                                {/* Incorrect Bar (Red) */}
                                <rect
                                    x={groupX + barWidth + gap}
                                    y={getY(d.incorrect)}
                                    width={barWidth}
                                    height={incorrectH}
                                    fill="#f43f5e"
                                    rx="4"
                                    className="hover:opacity-80 transition-opacity"
                                />
                                {d.incorrect > 0 && <text x={groupX + barWidth + gap + barWidth / 2} y={getY(d.incorrect) - 5} textAnchor="middle" fill="#f43f5e" fontSize="12" fontWeight="bold">{d.incorrect}</text>}
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-lg bg-emerald-500"></div>
                    <span className="text-sm font-bold text-slate-600">הצלחות</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-lg bg-rose-500"></div>
                    <span className="text-sm font-bold text-slate-600">טעויות</span>
                </div>
            </div>
        </div>
    );
}
