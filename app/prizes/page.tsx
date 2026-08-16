'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Award, Gift, ShieldCheck, Sparkles, ArrowRight, Star } from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function PrizesPage() {
  const prizeCategories = [
    {
      title: 'Grand Champions',
      subtitle: 'Top Pitch Winners Across Tracks',
      amount: '₹50,000+',
      perks: ['Grand Winner Trophy & Certificates', '1-on-1 Mentorship Session', 'Direct Incubation Opportunity', 'Media Feature'],
      icon: Trophy,
      accent: 'from-amber-400 to-amber-600',
    },
    {
      title: 'First Runners-Up',
      subtitle: 'Excellence in Innovation & Tech',
      amount: '₹30,000+',
      perks: ['Runners-Up Trophy & Certificates', 'Industry Expert Mentorship', 'Incubation Pipeline Review'],
      icon: Award,
      accent: 'from-slate-300 to-slate-500',
    },
    {
      title: 'Category Excellence Awards',
      subtitle: 'Best Social Impact, Best Tech MVP',
      amount: '₹20,000+',
      perks: ['Special Category Shield', 'Certificate of Excellence', 'Investor Connect Networking'],
      icon: Star,
      accent: 'from-amber-600 to-orange-700',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="she-category-tag">Rewards & Recognition</span>
        <AnimatedTitle
          text="₹1,00,000 Prize Pool & Awards"
          gradientWords={['Prize', 'Pool']}
          className="text-4xl sm:text-6xl font-extrabold text-gray-900"
        />
        <p className="text-gray-600 text-lg leading-relaxed">
          ShePitch celebrates women visionaries with substantial cash prizes, trophies, shields, and career-launching incubation support.
        </p>
      </div>

      {/* Main Hero Prize Banner */}
      <div className="she-gradient-bg rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-300" /> Total Cash Prize Pool
        </div>
        <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight">₹1,00,000</h2>
        <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
          Plus Institutional Shields of Recognition, Certificates for All Finalists, and Direct Access to 80+ Industry Mentors.
        </p>
      </div>

      {/* Additional Rewards */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl space-y-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center">Beyond Cash Prizes</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-gray-50 space-y-3">
            <Trophy className="w-8 h-8 text-[#6C3B8F]" />
            <h4 className="font-bold text-gray-900 text-base">Shield of Recognition</h4>
            <p className="text-xs text-gray-600">Collaborating colleges receive official shields on the grand finale main stage.</p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 space-y-3">
            <Gift className="w-8 h-8 text-[#E83E8C]" />
            <h4 className="font-bold text-gray-900 text-base">National Certificates</h4>
            <p className="text-xs text-gray-600">Every participant receives a verified ShePitch National Certificate of Participation.</p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 space-y-3">
            <Award className="w-8 h-8 text-[#6C3B8F]" />
            <h4 className="font-bold text-gray-900 text-base">Incubation Support</h4>
            <p className="text-xs text-gray-600">Top project teams receive guidance for patent filing, incubation, and startup grants.</p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 space-y-3">
            <Sparkles className="w-8 h-8 text-[#E83E8C]" />
            <h4 className="font-bold text-gray-900 text-base">Industry Networking</h4>
            <p className="text-xs text-gray-600">Direct exposure to 80+ founders, tech leaders, and corporate recruiters.</p>
          </div>

        </div>

        <div className="text-center pt-4">
          <Link href="/register" className="she-btn-primary">
            Compete For Prizes & Certificates <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
