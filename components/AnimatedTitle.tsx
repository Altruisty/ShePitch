'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  gradientWords?: string[];
}

export default function AnimatedTitle({ text, className = '', gradientWords = [] }: AnimatedTitleProps) {
  const words = text.split(' ');

  let charIndexCounter = 0;

  return (
    <h2 className={`font-bold tracking-tight ${className}`}>
      {words.map((word, wordIdx) => {
        const isGradient = gradientWords.some((gw) => gw.toLowerCase() === word.toLowerCase().replace(/[^a-z]/g, ''));
        const chars = word.split('');

        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em] last:mr-0">
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
        );
      })}
    </h2>
  );
}
