import React, { useState } from 'react';

// Knowledge Base for RAG (Retrieval-Augmented Generation)
// In a real RAG system, this would be a vector DB retrieval.
const TIPS_DB = {
    addition: [
        "טיפ: כשמחברים מספרים גדולים, תמיד תתחילו מהאחדות (צד ימין) ותעברו לעשרות.",
        "האם ידעת? חיבור הוא חילופי! 5 + 3 זה בדיוק כמו 3 + 5."
    ],
    subtraction: [
        "טיפ: אם המספר למעלה קטן מהמספר למטה, תצטרכו 'ללוות' מהשכן (מהעשרות).",
        "דרך קלה לחסר: תחשבו כמה חסר לכם כדי להגיע למספר הגדול."
    ],
    multiplication: [
        "טיפ: כפל הוא בעצם חיבור חוזר. 3 × 4 זה בעצם 4 + 4 + 4.",
        "כל מספר כפול 0 תמיד שווה ל-0. כל מספר כפול 1 נשאר אותו דבר!"
    ],
    division: [
        "טיפ: חילוק הוא ההפך מכפל. אם 3 × 4 = 12, אז 12 ÷ 3 = 4.",
        "אי אפשר לחלק ב-0! זה החוק הכי חשוב במתמטיקה."
    ],
    percent: [
        "טיפ: אחוז (%) הוא פשוט חלק מתוך 100. 50% זה בדיוק חצי.",
        "כדי למצוא 10% ממספר, פשוט תורידו לו את האפס האחרון (או הזיזו את הנקודה שמאלה)."
    ]
};

export default function SmartTip({ topic }) {
    const [showTip, setShowTip] = useState(false);
    const [tip, setTip] = useState("");

    // Default to general if topic not found
    const normalizedTopic = topic ? topic.toLowerCase() : "general";

    const getSmartTip = () => {
        // 1. Retrieval: Search DB for relevant docs
        const candidates = TIPS_DB[normalizedTopic] || ["טיפ כללי: קראו את השאלה לאט ושמרו על ריכוז!"];

        // 2. Select specific knowledge (Random for variety)
        const selected = candidates[Math.floor(Math.random() * candidates.length)];

        setTip(selected);
        setShowTip(true);
    };

    return (
        <div className="mt-4">
            {!showTip ? (
                <button
                    onClick={getSmartTip}
                    className="flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                    <span>💡</span> קבל רמז חכם (RAG)
                </button>
            ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 animate-fade-in-up">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">AI ASSISTANT</span>
                        <button onClick={() => setShowTip(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    <p className="text-slate-700 font-medium">
                        {tip}
                    </p>
                </div>
            )}
        </div>
    );
}
