'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Handshake,
  Building2,
  Utensils,
  Camera,
  ShoppingBag,
  Store,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  MapPin,
  Coffee,
  Globe,
  Award,
} from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function PartnersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16 sm:space-y-24">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="she-category-tag bg-purple-100 text-[#6C3B8F] border-purple-200">
          OUR ECOSYSTEM & PARTNERS
        </span>
        <AnimatedTitle
          text="Powered By Innovation & Esteemed Partners"
          gradientWords={['Innovation', 'Partners']}
          mobileBreakWords={['Innovation']}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight"
        />
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          ShePitch Chennai is made possible through the dedicated leadership of our organizers, ecosystem leaders, community builders, and industry partners.
        </p>
      </div>

      {/* ROW-BY-ROW PARTNERS SECTION */}
      <div className="space-y-16">
        
        {/* ROW 1: ORGANIZED BY UGHAM */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-[#6C3B8F] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORGANIZED BY</span>
          </div>

          <div className="max-w-md mx-auto">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl p-8 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col items-center justify-center group"
            >
              <div className="w-full h-32 relative flex items-center justify-center p-4 bg-purple-50/40 rounded-2xl">
                <Image
                  src="/assets/partners-imgs/part-4.png"
                  alt="UGHAM Logo"
                  width={220}
                  height={110}
                  className="object-contain max-h-24 group-hover:scale-105 transition-transform"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ROW 2: POWERED BY ICEBRKR */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-[#E83E8C] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>POWERED BY</span>
          </div>

          <div className="max-w-md mx-auto">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl p-8 border-2 border-pink-200 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col items-center justify-center group"
            >
              <div className="w-full h-32 relative flex items-center justify-center p-4 bg-pink-50/40 rounded-2xl">
                <Image
                  src="/assets/partners-imgs/part-2.png"
                  alt="icebrkr Logo"
                  width={220}
                  height={110}
                  className="object-contain max-h-24 group-hover:scale-105 transition-transform"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ROW 3: ECOSYSTEM PARTNER - TNRISE */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>ECOSYSTEM PARTNER</span>
          </div>

          <div className="max-w-lg mx-auto">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl p-8 border-2 border-indigo-200 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col items-center justify-center group"
            >
              <div className="w-full h-36 relative flex items-center justify-center p-4 bg-indigo-50/30 rounded-2xl">
                <Image
                  src="/assets/partners-imgs/tnrise-women.png"
                  alt="TNRISE Logo"
                  width={260}
                  height={120}
                  className="object-contain max-h-28 group-hover:scale-105 transition-transform"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ROW 4: COMMUNITY PARTNER - SHE BUILDS */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>COMMUNITY PARTNER</span>
          </div>

          <div className="max-w-lg sm:max-w-xl mx-auto">
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-rose-200 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col items-center justify-center group"
            >
              <div className="w-full h-52 sm:h-64 relative flex items-center justify-center p-2 bg-rose-50/40 rounded-2xl">
                <Image
                  src="/assets/partners-imgs/shebuilds-chennai.png"
                  alt="She Builds Chennai Logo"
                  width={380}
                  height={240}
                  className="object-contain max-h-48 sm:max-h-60 group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ROW 5: SPECIALIZED PARTNERS (DATEBITES, ALTRUSTY, JEPPIAAR UNIVERSITY) */}
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>COLLABORATING & VENUE PARTNERS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Refreshment Partner: DateBites */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all space-y-4 flex flex-col items-center justify-between group"
            >
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                REFRESHMENT PARTNER
              </span>
              <div className="w-full h-28 relative flex items-center justify-center p-3 bg-amber-50/40 rounded-2xl my-2">
                <Image
                  src="/assets/partners-imgs/datebites-farmley.png"
                  alt="DateBites / Farmley Logo"
                  width={180}
                  height={90}
                  className="object-contain max-h-20 group-hover:scale-105 transition-transform"
                />
              </div>
            </motion.div>

            {/* Industry Partner: Altruisty */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all space-y-4 flex flex-col items-center justify-between group"
            >
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                INDUSTRY PARTNER
              </span>
              <div className="w-full h-28 relative flex items-center justify-center p-3 bg-blue-50/40 rounded-2xl my-2">
                <Image
                  src="/assets/partners-imgs/part-3.png"
                  alt="Altruisty Logo"
                  width={180}
                  height={90}
                  className="object-contain max-h-20 group-hover:scale-105 transition-transform"
                />
              </div>
            </motion.div>

            {/* Venue Partner: Jeppiaar University */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all space-y-4 flex flex-col items-center justify-between group"
            >
              <span className="bg-purple-100 text-[#6C3B8F] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" /> VENUE PARTNER
              </span>
              <div className="w-full h-28 relative flex items-center justify-center p-3 bg-purple-50/40 rounded-2xl my-2">
                <Image
                  src="/assets/partners-imgs/part-1.png"
                  alt="Jeppiaar University Logo"
                  width={180}
                  height={90}
                  className="object-contain max-h-20 group-hover:scale-105 transition-transform"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ROW 6: EVENT PARTNER - ICC / TN COLLEGE CHRONICLE */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>EVENT PARTNER</span>
          </div>

          <div className="max-w-md mx-auto">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl p-8 border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col items-center justify-center group"
            >
              <div className="w-full h-36 relative flex items-center justify-center p-4 bg-emerald-50/30 rounded-2xl">
                <Image
                  src="/assets/partners-imgs/icc-tn-chronicle.jpg"
                  alt="TN College Chronicle / ICC Logo"
                  width={160}
                  height={160}
                  className="object-contain max-h-28 rounded-full group-hover:scale-105 transition-transform shadow-md"
                />
              </div>
            </motion.div>
          </div>
        </div>

      </div>

    </div>
  );
}
