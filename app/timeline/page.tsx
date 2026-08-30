'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trophy, CheckCircle2, ArrowRight, DollarSign } from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function TimelinePage() {
  const steps = [
    {
      step: 'STEP 01',
      title: 'Registration Opens',
      subtitle: 'Get ready to register your team',
      date: '14 Aug 2026',
      badge: 'Active Now',
      color: 'from-[#6C3B8F] to-[#a823f5]',
      desc: 'Form your team (min 2 members), select your category track, and submit registration details online.',
    },
    {
      step: 'STEP 02',
      title: 'Registration Deadline',
      subtitle: 'Final submissions close',
      date: '08 Sept 2026',
      badge: '11:59 PM IST',
      color: 'from-amber-500 to-orange-500',
      desc: 'All team details, deck submissions, and registration fees must be completed prior to this cutoff time.',
    },
    {
      step: 'STEP 03',
      title: 'Grand Finale Event',
      subtitle: 'Live pitch & award ceremony',
      date: '19 Sept 2026',
      badge: 'Jeppiaar University',
      color: 'from-[#f523e4] to-[#b307f1]',
      desc: 'Offline event hosted at Jeppiaar University, Chennai featuring live pitches, founder keynotes, networking, and ₹1L cash prize awards.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="she-category-tag">Important Dates</span>
        <AnimatedTitle
          text="ShePitch Chennai Timeline & Milestones"
          gradientWords={['Chennai', 'Timeline']}
          mobileBreakWords={['Timeline']}
          className="text-4xl sm:text-6xl font-extrabold text-gray-900"
        />
        <p className="text-gray-600 text-lg leading-relaxed">
          Mark your calendar for these critical dates in the ShePitch national competition trajectory.
        </p>
      </div>

      {/* Timeline Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`bg-gradient-to-r ${item.color} text-white px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider`}>
                  {item.step}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 font-medium">{item.subtitle}</p>

              <div className="py-3 border-y border-gray-100">
                <span className="text-3xl font-extrabold she-gradient-text block">{item.date}</span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Details Box */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Event Overview & Logistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-5 rounded-2xl bg-gray-50 flex items-start gap-4">
            <div className="she-svg-icon-wrapper shrink-0">
              <Clock className="w-5 h-5 text-[#6C3B8F]" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block text-sm">Registration Fee</span>
              <span className="text-sm text-gray-600">₹299 per participant</span>
              <span className="text-xs text-[#E83E8C] block font-semibold mt-1">₹100 discount for partner colleges</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 flex items-start gap-4">
            <div className="she-svg-icon-wrapper shrink-0">
              <MapPin className="w-5 h-5 text-[#6C3B8F]" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block text-sm">Grand Finale Venue</span>
              <span className="text-sm text-gray-600">Jeppiaar University, Chennai</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 flex items-start gap-4">
            <div className="she-svg-icon-wrapper shrink-0">
              <Trophy className="w-5 h-5 text-[#6C3B8F]" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block text-sm">Grand Prize Pool</span>
              <span className="text-sm text-gray-600">₹1,00,000 Total Cash Awards</span>
            </div>
          </div>

        </div>

        <div className="pt-4 text-center">
          <Link href="/register" className="she-btn-primary">
            Register Before 14 September <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
