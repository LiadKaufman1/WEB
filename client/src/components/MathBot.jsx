import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../config';

export default function MathBot({ onScoreUpdate, username }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [topic, setTopic] = useState("addition");
    const [level, setLevel] = useState("easy");
    const [currentQ, setCurrentQ] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const chatEndRef = useRef(null);

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Init bot on open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const q = generateSingleQuestion(topic, level);
            setCurrentQ(q);
            setMessages([{
                id: 1,
                sender: 'bot',
                text: `היי ${username || 'חבר'}! אני MathBot 🤖. בוא נתרגל חשבון! הנה השאלה הראשונה: ${q.question.replace(' = ?', '')}`
            }]);
        }
    }, [isOpen]);

    // Generate question logic (Ported from home.html)
    function generateSingleQuestion(topic, level) {
        let maxNum = 20;
        if (level === "medium") maxNum = 50;
        if (level === "hard") maxNum = 100;

        let questionStr = "";
        let correctAns = "";

        if (topic === "addition" || topic === "subtraction") {
            const isPlus = (topic === "addition");
            let a = Math.floor(Math.random() * maxNum) + 1;
            let b = Math.floor(Math.random() * maxNum) + 1;

            let val;
            if (isPlus) {
                val = a + b;
                questionStr = `${a} + ${b} = ?`;
            } else {
                if (a < b) [a, b] = [b, a];
                val = a - b;
                questionStr = `${a} - ${b} = ?`;
            }
            correctAns = val.toString();

        } else if (topic === "multiplication") {
            let range = 9; let min = 2;
            if (level === "medium") { range = 12; }
            if (level === "hard") { range = 19; }

            const a = Math.floor(Math.random() * range) + min;
            const b = Math.floor(Math.random() * range) + min;
            questionStr = `${a} × ${b} = ?`;
            correctAns = (a * b).toString();

        } else if (topic === "division") {
            let range = 9; let min = 2;
            if (level === "medium") range = 12;
            if (level === "hard") range = 19;

            const a = Math.floor(Math.random() * range) + min;
            const b = Math.floor(Math.random() * range) + min;
            const product = a * b;
            questionStr = `${product} ÷ ${a} = ?`;
            correctAns = b.toString();
        } else {
            // Fallback simple addition
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            questionStr = `${a} + ${b} = ?`;
            correctAns = (a + b).toString();
        }

        return {
            question: questionStr,
            correct: correctAns
        };
    }

    async function handleSend() {
        if (!input.trim()) return;

        const userText = input.trim();
        const newMsgs = [...messages, { id: Date.now(), sender: 'user', text: userText }];
        setMessages(newMsgs);
        setInput("");

        // Validate
        const isCorrect = userText === currentQ.correct;

        if (isCorrect) {
            // API Call
            try {
                const res = await fetch(`${API_URL}/score/${topic}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, points: 5 })
                });
                const data = await res.json();

                if (data.ok) {
                    onScoreUpdate(); // Refresh stats
                    const nextQ = generateSingleQuestion(topic, level);
                    setCurrentQ(nextQ);
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        text: `כל הכבוד! צדקת 🎉 (+5 נקודות). השאלה הבאה: ${nextQ.question.replace(' = ?', '')}`
                    }]);
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `לא בדיוק... נסה שוב! 🤔`
            }]);
        }
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 left-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            >
                <span className="text-3xl">🤖</span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 left-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in-up" style={{ maxHeight: '500px' }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <span>🤖</span> MathBot
                        </h3>
                        <div className="flex gap-2">
                            <select
                                className="text-slate-800 text-xs rounded p-1 outline-none cursor-pointer"
                                value={topic}
                                onChange={(e) => {
                                    setTopic(e.target.value);
                                    const q = generateSingleQuestion(e.target.value, level);
                                    setCurrentQ(q);
                                    setMessages(prev => [...prev, {
                                        id: Date.now(),
                                        sender: 'bot',
                                        text: `עברנו לנושא: ${e.target.value}. השאלה: ${q.question.replace(' = ?', '')}`
                                    }]);
                                }}
                            >
                                <option value="addition">חיבור</option>
                                <option value="subtraction">חיסור</option>
                                <option value="multiplication">כפל</option>
                                <option value="division">חילוק</option>
                            </select>
                            <button onClick={() => setIsOpen(false)} className="hover:text-red-200 font-bold">✕</button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3 h-80">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="התשובה שלך..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
