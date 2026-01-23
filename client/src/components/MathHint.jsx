
import React, { useState, useEffect } from 'react';
import { fetchHint } from '../services/aiService';

const MathHint = ({ num1, num2, operator }) => {
    const [hint, setHint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // Reset when question changes
    useEffect(() => {
        setHint(null);
        setLoading(false);
        setOpen(false);
    }, [num1, num2, operator]);

    const handleGetHint = async () => {
        // If closed, open it. If open, just fetch (refresh).
        if (!open) setOpen(true);

        setLoading(true);
        // We set hint to null briefly to show loading state effectively if it was already showing a hint
        setHint(null);

        const fetchedHint = await fetchHint(num1, num2, operator);
        setHint(fetchedHint || "מצטער, הייתה לי בעיה למצוא רמז כרגע. נסה שוב מאוחר יותר.");
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto mt-6 mb-2">
            {!open && (
                <button
                    onClick={handleGetHint}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-50 text-indigo-700 font-bold rounded-xl border-2 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-sm"
                >
                    <span>💡</span>
                    <span>לחץ עליי לעזרה בפתרון</span>
                </button>
            )}

            {open && (
                <div className="bg-white border-2 border-indigo-100 rounded-xl p-5 relative animate-fade-in shadow-md">
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
                    >
                        ✕
                    </button>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 text-indigo-600 py-4">
                            <span className="animate-spin text-3xl">⚙️</span>
                            <span className="font-bold">מתי חושב על רמז...</span>
                        </div>
                    ) : (
                        <div className="text-right pt-2" dir="rtl">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-50">
                                <span className="text-2xl">🤖</span>
                                <h4 className="font-bold text-indigo-800">הטיפ של מתי:</h4>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg font-medium whitespace-pre-line">
                                {hint}
                            </p>

                            <button
                                onClick={() => handleGetHint()}
                                className="w-full mt-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-95 border border-indigo-200 shadow-sm"
                                title="נסה רמז אחר"
                            >
                                <span className="text-2xl">🔄</span>
                                <span className="text-lg">לא עזר? נסה רמז אחר</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MathHint;
