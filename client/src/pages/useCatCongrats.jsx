import { useRef, useState } from "react";

export default function useCatCongrats(durationMs = 900) {
  const tRef = useRef(null);
  const [catFx, setCatFx] = useState(false);

  function triggerCatFx() {
    setCatFx(true);
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setCatFx(false), durationMs);
  }

  const CatCongrats = () =>
    catFx ? (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ position: "relative", animation: "catCenter 0.9s ease-out forwards" }}>
          <div
            style={{
              position: "absolute",
              inset: -18,
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              opacity: 0.9,
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.18))",
              animation: "confetti 0.9s ease-out forwards",
            }}
          >
            ✨ 🎉 ✨ 🎊 ✨
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 20,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
            }}
          >
            <div style={{ fontSize: 44, lineHeight: 1 }}>🐱</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>כל הכבוד!</div>
              <div style={{ fontWeight: 700, fontSize: 13, opacity: 0.75 }}>
                תשובה נכונה 🎉
              </div>
            </div>
            <div style={{ fontSize: 24 }}>✨</div>
          </div>

          <style>{`
            @keyframes catCenter {
              0%   { transform: translateY(12px) scale(0.65); opacity: 0; }
              35%  { transform: translateY(0px)  scale(1.08); opacity: 1; }
              70%  { transform: translateY(-2px) scale(1.00); opacity: 1; }
              100% { transform: translateY(-10px) scale(0.96); opacity: 0; }
            }
            @keyframes confetti {
              0%   { transform: scale(0.6) rotate(-6deg); opacity: 0; }
              35%  { transform: scale(1.05) rotate(6deg); opacity: 1; }
              100% { transform: scale(1.0) rotate(0deg); opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    ) : null;

  return { triggerCatFx, CatCongrats, catFx };
}
