'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  gradientWords?: string[];
  mobileBreakWords?: string[];
}

export default function AnimatedTitle({
  text,
  className = '',
  gradientWords = [],
  mobileBreakWords = [],
}: AnimatedTitleProps) {
  const words = text.split(' ');

  let charIndexCounter = 0;

  return (
    <h2 className={`font-bold tracking-tight ${className}`}>
      {words.map((word, wordIdx) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        const isGradient = gradientWords.some((gw) => gw.toLowerCase() === cleanWord);
        const shouldBreakMobile = mobileBreakWords.some((bw) => bw.toLowerCase() === cleanWord);
        const chars = word.split('');

        return (
          <React.Fragment key={wordIdx}>
            <span className="inline-block whitespace-nowrap mr-[0.25em] last:mr-0">
              {chars.map((char, charIdx) => {
                const currentCharIndex = charIndexCounter++;
                return (
                  <motion.span
                    key={charIdx}
                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.4,
                      delay: currentCharIndex * 0.025,
                      ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                    className={`inline-block ${
                      isGradient ? 'she-gradient-text font-extrabold' : ''
                    }`}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
            {shouldBreakMobile && <br className="block sm:hidden" />}
          </React.Fragment>
        );
      })}
    </h2>
  );
}
