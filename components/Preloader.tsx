'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const brandText = 'SHEPITCH'.split('');

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[100] bg-[#0c0414] text-white flex items-center justify-center overflow-hidden"
        >
          {/* Animated Letter by Letter Brand Text */}
          <div className="flex items-center gap-1 sm:gap-2 text-3xl sm:text-5xl md:text-6xl font-black tracking-widest uppercase">
            {brandText.map((char, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.08,
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
                className={idx >= 3 ? 'text-[#E83E8C]' : 'text-white'}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Curved SVG Arch Curtain at Bottom */}
          <svg className="absolute bottom-0 w-full h-[120px] pointer-events-none fill-[#0c0414]" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,320 L0,160 Q720,0 1440,160 L1440,320 Z"></path>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
