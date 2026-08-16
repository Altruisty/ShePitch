'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lightbulb, Laptop, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="she-category-tag">Tracks</span>
        <AnimatedTitle
          text="Competition Categories & Tracks"
          gradientWords={['Categories', 'Tracks']}
          className="text-4xl sm:text-6xl font-extrabold text-gray-900"
        />
        <p className="text-gray-600 text-lg leading-relaxed">
          Select the innovation track that best matches your project maturity. Both tracks compete for cash prizes, trophies, and mentorship.
        </p>
      </div>

      {/* Categories Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Track 1: Idea Pitch */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-xl space-y-8 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none" />

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center shrink-0">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C3B8F] bg-[#6C3B8F]/10 px-3 py-1 rounded-full">
                  Track 01
                </span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">Idea Pitch</h3>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-base">
              Ideal for conceptual innovations, early-stage startup proposals, or business plans. Designed to validate problem-solution fit and market feasibility.
            </p>

            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Track Deliverables & Requirements:</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3B8F] shrink-0 mt-0.5" />
                  <span><strong>Format:</strong> Presentation Deck (10-12 slides in PPT or PDF format).</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3B8F] shrink-0 mt-0.5" />
                  <span><strong>Prototype:</strong> No physical or working software prototype required.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3B8F] shrink-0 mt-0.5" />
                  <span><strong>Focus Areas:</strong> Problem Statement, Innovation, Target Audience, Feasibility, Revenue Model.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3B8F] shrink-0 mt-0.5" />
                  <span><strong>Presentation:</strong> 5-minute verbal presentation + 3-minute Q&A with industry judges.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">Stage:</span>
              <span className="font-bold text-gray-900">Concept & Market Validation</span>
            </div>
            <Link href="/register?category=Idea Pitch" className="she-btn-outline w-full justify-center text-center py-3">
              Register For Idea Pitch <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>

        {/* Track 2: Project Pitch */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-xl space-y-8 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-full pointer-events-none" />

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E83E8C]/10 text-[#E83E8C] flex items-center justify-center shrink-0">
                <Laptop className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E83E8C] bg-[#E83E8C]/10 px-3 py-1 rounded-full">
                  Track 02
                </span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">Project Pitch</h3>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-base">
              Tailored for teams with functional prototypes, working software applications, hardware setups, or working MVPs ready to demonstrate live.
            </p>

            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Track Deliverables & Requirements:</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#E83E8C] shrink-0 mt-0.5" />
                  <span><strong>Format:</strong> Presentation Deck + Working Demonstration.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#E83E8C] shrink-0 mt-0.5" />
                  <span><strong>Prototype:</strong> Functional software, app, web tool, or hardware model mandatory.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#E83E8C] shrink-0 mt-0.5" />
                  <span><strong>Focus Areas:</strong> Technical Architecture, Working Demo, Scalability, User Interface, Market Traction.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#E83E8C] shrink-0 mt-0.5" />
                  <span><strong>Presentation:</strong> 7-minute pitch & live demo + 4-minute Q&A with experts.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">Stage:</span>
              <span className="font-bold text-gray-900">Prototype / Functional Model</span>
            </div>
            <Link href="/register?category=Project Pitch" className="she-btn-primary w-full justify-center text-center py-3">
              Register For Project Pitch <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Rules Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 flex items-start gap-4 text-amber-900">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <h4 className="font-bold text-base text-amber-950">Important Participation Rules:</h4>
          <p>
            Each team can register for only one track. Minimum team size is 2 members, maximum 4 members. Cross-college teams are permitted as long as all team members are active women students.
          </p>
        </div>
      </div>
    </div>
  );
}
