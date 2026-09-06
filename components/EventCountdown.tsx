'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EventCountdownProps {
  variant?: 'banner' | 'card' | 'compact';
  showCta?: boolean;
  className?: string;
}

// Target Date: 19 September 2026, 9:00 AM IST
const TARGET_DATE = new Date('2026-09-19T09:00:00+05:30').getTime();

export default function EventCountdown({
  variant = 'banner',
  showCta = true,
  className = '',
}: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = TARGET_DATE - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isLive: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  // Compact variant (e.g. for small sidebar cards)
  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-2xl bg-purple-50/70 border border-purple-100 ${className}`}>
        <div className="flex items-center gap-2 mb-2 text-[#6C3B8F]">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Event Countdown</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {timeUnits.map((u, i) => (
            <div key={i} className="bg-white p-2 rounded-xl border border-purple-100/60 shadow-sm">
              <span className="block text-lg font-black text-gray-900 font-mono">
                {mounted ? String(u.value).padStart(2, '0') : '--'}
              </span>
              <span className="block text-[9px] font-bold text-gray-500">{u.label.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6 ${className}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[#6C3B8F]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E83E8C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E83E8C]"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#6C3B8F]">Grand Finale Countdown</span>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            19 Sept 2026 &bull; 9:00 AM IST
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {timeUnits.map((u, i) => (
            <div
              key={i}
              className="bg-gradient-to-b from-purple-50/80 to-pink-50/40 p-3 sm:p-4 rounded-2xl border border-purple-100/80 text-center shadow-sm"
            >
              <span className="block text-2xl sm:text-4xl font-black text-gray-900 font-mono tracking-tight">
                {mounted ? String(u.value).padStart(2, '0') : '--'}
              </span>
              <span className="block text-[10px] sm:text-xs font-bold text-[#6C3B8F] uppercase tracking-wider mt-1">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Banner variant (Rich, responsive full-width banner)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-[#6C3B8F]/8 via-purple-50/70 to-[#E83E8C]/8 border border-purple-200/70 shadow-xl ${className}`}
    >
      {/* Background Decorative Blur circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E83E8C]/15 to-transparent rounded-bl-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#6C3B8F]/15 to-transparent rounded-tr-full pointer-events-none -z-0" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-purple-200 text-[#6C3B8F] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E83E8C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E83E8C]"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider">
              {timeLeft.isLive ? 'Event is Live Now!' : 'Grand Finale Countdown'}
            </span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
              Event Starts In
            </h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
              Join visionary student innovators live on stage in Chennai.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700 pt-1">
            <span className="inline-flex items-center gap-1.5 font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-xs">
              <Calendar className="w-4 h-4 text-[#6C3B8F]" />
              19 September 2026
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-xs">
              <Clock className="w-4 h-4 text-[#E83E8C]" />
              9:00 AM IST
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-xs">
              <MapPin className="w-4 h-4 text-[#6C3B8F]" />
              Jeppiaar University
            </span>
          </div>
        </div>

        {/* Right Timer Column */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 sm:gap-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full max-w-lg">
            {timeUnits.map((u, i) => (
              <div
                key={i}
                className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 border border-purple-100 shadow-lg text-center flex flex-col items-center justify-center min-w-[65px] sm:min-w-[85px] transition-transform hover:-translate-y-1"
              >
                <span className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 font-mono tracking-tight she-gradient-text">
                  {mounted ? String(u.value).padStart(2, '0') : '--'}
                </span>
                <span className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mt-1">
                  {u.label}
                </span>
              </div>
            ))}
          </div>

          {showCta && (
            <div className="shrink-0 pt-2 sm:pt-0">
              <Link
                href="/register"
                className="she-btn-primary text-xs sm:text-sm px-6 py-3 whitespace-nowrap shadow-lg hover:shadow-xl"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
