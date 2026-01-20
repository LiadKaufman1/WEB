import ScoreBadge from "../components/ScoreBadge"; // Import

/* ... imports ... */

export default function PracticeAddition() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("easy");
  const [q, setQ] = useState(() => makeQuestion("easy"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [noPointsThisQuestion, setNoPointsThisQuestion] = useState(false);
  const [shake, setShake] = useState(false);

  // Score State
  const [score, setScore] = useState(0);
  const [addedPoints, setAddedPoints] = useState(0);

  // Fetch initial score
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      fetch(`${API_BASE}/user/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.user) {
            // Calculate total score or just addition? 
            // User Balance usually implies Total Score.
            const total = (data.user.addition || 0) + (data.user.subtraction || 0) + (data.user.multiplication || 0) + (data.user.division || 0) + (data.user.percent || 0);
            // But wait, if we only show total, we need to know WHICH field updated to animate well?
            // For simplicity, let's track the field we are practicing + total.
            // Actually, the Shop uses "Total Score - Spent". 
            // Let's show "Available Balance" (Total - Spent) like in the Shop?
            // Or just "Addition Score"?
            // The user said "points accumulate", usually implies the global currency.
            // Let's show TOTAL POINTS (Available).
            const available = total - (data.user.spentPoints || 0);
            setScore(available);
          }
        });
    }
  }, []);

  async function incAdditionScoreIfAllowed(isCorrect = true) {
    if (noPointsThisQuestion && isCorrect) return;
    const username = localStorage.getItem("username");
    if (!username) return;

    const points = LEVELS[level]?.points || 1;

    try {
      const res = await fetch(`${API_BASE}/score-v3/addition?t=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, points, isCorrect: !!isCorrect }),
      });
      const data = await res.json();

      if (data.ok && isCorrect) {
        // Update local score from response if possible, or just increment?
        // The response has `newScore` (field score). 
        // We want Total Available.
        // Calculating exact total locally is risky.
        // Let's just increment locally for the animation, trusting the server.
        setScore(prev => prev + points);
        setAddedPoints(points);
        setTimeout(() => setAddedPoints(0), 2000); // Reset animation prop
      }

    } catch {
      setMsg(prev => `${prev} [ERR]`);
    }
  }

  function checkAnswer() {
    const val = Number(input);
    if (input.trim() === "" || !Number.isFinite(val)) {
      const m = "אנא הקלד מספר";
      setMsg(m);
      savePracticeState({ msg: m });
      return;
    }

    if (val === q.ans) {
      const earned = LEVELS[level]?.points || 1;
      const m = noPointsThisQuestion
        ? "✅ נכון! (ללא נקודות)"
        : `✅ נכון! הרווחת ${earned} נקודות!`;
      setMsg(m);
      savePracticeState({ msg: m });

      triggerCatFx();
      triggerSmartConfetti(); // 🎉 CONFETTI
      incAdditionScoreIfAllowed(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => goNextQuestion(level), 1500);
      return;
    }

    triggerBadCatFx();
    setShake(true); // 🫨 SHAKE
    setTimeout(() => setShake(false), 500); // Reset shake

    const m = "❌ טעות, נסה שוב";
    setMsg(m);
    incAdditionScoreIfAllowed(false);
    savePracticeState({ msg: m });
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="mx-auto max-w-lg mt-8 px-4">
      <ScoreBadge score={score} addedPoints={addedPoints} />
      <CatCongrats />
      <CatUncongrats />

      <div className="card p-6 md:p-8">
        <h2 className="text-3xl font-black text-slate-900 border-b pb-4 mb-4">תרגול חיבור ➕</h2>

        {/* Level Selection */}
        <div className="grid grid-cols-3 gap-2 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          {Object.keys(LEVELS).map((lvlKey) => (
            <button
              key={lvlKey}
              onClick={() => changeLevel(lvlKey)}
              className={`py-2 rounded-xl text-sm font-bold transition-all ${level === lvlKey
                ? "bg-white text-blue-600 shadow-sm ring-2 ring-blue-100 scale-105"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
            >
              {lvlKey === "easy" ? "קל 😺" : lvlKey === "medium" ? "בינוני 🐾" : "קשה 🐯"}
            </button>
          ))}
        </div>

        {/* Question Display */}
        <div className="text-center py-6" dir="ltr">
          <div className="flex items-center justify-center gap-4 text-5xl md:text-6xl font-black text-slate-800 tracking-wider">
            <span>{q.a}</span>
            <span className="text-blue-500">+</span>
            <span>{q.b}</span>
            <span>=</span>
          </div>
        </div>

        {/* Answer Input */}
        <motion.div
          className="mb-6"
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              savePracticeState({ input: e.target.value });
            }}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            placeholder="?"
            type="number"
            className={`w-full text-center text-3xl font-bold py-4 rounded-2xl border-2 transition-all outline-none placeholder:text-slate-300 ${shake
              ? "border-rose-400 bg-rose-50 text-rose-600"
              : "border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
            autoFocus
          />
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={checkAnswer}
            className="w-full py-4 text-xl font-bold rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
          >
            בדוק תשובה
          </button>

          <button
            onClick={() => goNextQuestion(level)}
            className="w-full py-3 font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
            title="דלג לתרגיל הבא"
          >
            דלג ➜
          </button>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg animate-bounce-in ${msg.includes("נכון") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
            {msg}
          </div>
        )}

        <div className="mt-6">
          <SmartTip topic="addition" />
        </div>

        {/* Level Info */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
            <span>ℹ️</span> {LEVEL_TEXT[level]?.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {LEVEL_TEXT[level]?.body}
          </p>
        </div>
      </div>
    </div>
  );
}
