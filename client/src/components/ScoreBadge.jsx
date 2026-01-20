import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

export default function ScoreBadge({ score, addedPoints }) {
    const [displayScore, setDisplayScore] = useState(score);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setDisplayScore(score);
    }, [score]);

    useEffect(() => {
        if (addedPoints > 0) {
            setIsAnimating(true);
            const t = setTimeout(() => setIsAnimating(false), 2000);
            return () => clearTimeout(t);
        }
    }, [addedPoints]);

    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
            {/* Flying Coin Pts Indicator */}
            <AnimatePresence>
                {addedPoints > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, x: 0, scale: 1.5 }}
                        exit={{ opacity: 0, y: -20, scale: 0.5 }}
                        className="absolute -right-8 -bottom-8 text-2xl font-black text-yellow-500 drop-shadow-sm"
                    >
                        +{addedPoints}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scale Animation on Update */}
            <motion.div
                animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                className="bg-white/90 backdrop-blur-sm border-2 border-yellow-400 px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
            >
                <motion.div
                    animate={isAnimating ? { rotate: 360 } : {}}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <Coins className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </motion.div>
                <span className="font-black text-slate-800 text-xl font-mono">
                    {displayScore}
                </span>
            </motion.div>
        </div>
    );
}
