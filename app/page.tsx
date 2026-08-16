'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Lightbulb, Users, Calendar, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* Background Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-[#6C3B8F]/15 to-[#E83E8C]/15 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              <div>
                <span className="she-category-tag text-xs sm:text-sm">
                  National Women's Innovation Pitch
                </span>
              </div>

              {/* Title lines */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight text-gray-900">
                  <span className="block">She Dreams.</span>
                  <span className="block she-gradient-text">She Creates.</span>
                  <span className="block">She Leads.</span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl font-normal leading-relaxed">
                A national platform created by <strong className="text-gray-900">UGHAM</strong> to empower women students to pitch innovative ideas, showcase projects, and connect with industry leaders.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4 pt-1">
                <Link href="/register" className="she-btn-primary text-xs sm:text-sm px-6 py-3">
                  Register Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/about" className="she-btn-outline text-xs sm:text-sm px-6 py-3">
                  Learn More
                </Link>
              </div>

              {/* Stats Badges */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="block text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#6C3B8F]">50+</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium leading-tight block">College Collaborations</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#6C3B8F]">1000+</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium leading-tight block">Women Participants</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#6C3B8F]">80+</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium leading-tight block">Industry Experts</span>
                </div>
              </div>
            </div>

            {/* Right Featured Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-3xl p-5 sm:p-6 lg:p-6 xl:p-8 border border-gray-100 shadow-2xl relative overflow-hidden space-y-4 sm:space-y-5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E83E8C]/10 to-transparent rounded-bl-full pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="she-gradient-bg text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Grand Finale
                  </span>
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    19 Sept 2026
                  </span>
                </div>

                {/* Event Heading */}
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">ShePitch</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Powered by <strong className="text-gray-800">icebrkr</strong> &bull; Venue Partner: <strong className="text-gray-800">Jeppiaar University</strong>
                  </p>
                </div>

                {/* Key Points */}
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-gray-50">
                    <div className="she-svg-icon-wrapper shrink-0">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#6C3B8F]" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block text-xs sm:text-sm">₹1,00,000 Prize Pool</span>
                      <span className="text-[11px] sm:text-xs text-gray-500">Cash prizes & certificates for winners</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-gray-50">
                    <div className="she-svg-icon-wrapper accent shrink-0">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-[#E83E8C]" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block text-xs sm:text-sm">2 Track Categories</span>
                      <span className="text-[11px] sm:text-xs text-gray-500">Idea Pitch & Project Pitch</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-gray-50">
                    <div className="she-svg-icon-wrapper shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#6C3B8F]" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block text-xs sm:text-sm">Team Entry</span>
                      <span className="text-[11px] sm:text-xs text-gray-500">Min. 2 members per team</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-1">
                  <Link href="/register" className="she-btn-primary w-full justify-center text-center text-xs sm:text-sm py-3">
                    Explore & Register <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== COMPETITION CATEGORIES PREVIEW ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-12">
          <span className="she-category-tag">Tracks</span>
          <AnimatedTitle
            text="Choose Your Innovation Path"
            gradientWords={['Innovation', 'Path']}
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900"
          />
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Select the track that aligns with your development stage to showcase your innovation on a national stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Idea Pitch */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="she-svg-icon-wrapper shrink-0">
                  <Lightbulb className="w-6 h-6 text-[#6C3B8F]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Idea Pitch</h3>
                  <span className="text-xs text-[#6C3B8F] font-bold uppercase tracking-wider">Concept Stage</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed">
                Designed for early-stage concepts, startup visions, or social-impact solutions requiring validation and mentorship.
              </p>

              <ul className="space-y-2.5 pt-2">
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3B8F] shrink-0" />
                  Early-stage concepts & visions
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3B8F] shrink-0" />
                  PPT/PDF pitch deck submission
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3B8F] shrink-0" />
                  No live working prototype needed
                </li>
              </ul>
            </div>

            <Link href="/register?category=Idea Pitch" className="she-btn-outline w-full justify-center text-center">
              Register for Idea Pitch
            </Link>
          </motion.div>

          {/* Card 2: Project Pitch */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="she-svg-icon-wrapper accent shrink-0">
                  <Sparkles className="w-6 h-6 text-[#E83E8C]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Project Pitch</h3>
                  <span className="text-xs text-[#E83E8C] font-bold uppercase tracking-wider">Prototype / MVP Stage</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed">
                Tailored for teams with working prototypes, MVPs, or functional technical models ready to demonstrate live.
              </p>

              <ul className="space-y-2.5 pt-2">
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#E83E8C] shrink-0" />
                  Functional models & hardware/software MVPs
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#E83E8C] shrink-0" />
                  Presentation deck required
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-[#E83E8C] shrink-0" />
                  Live working demonstration mandatory
                </li>
              </ul>
            </div>

            <Link href="/register?category=Project Pitch" className="she-btn-primary w-full justify-center text-center">
              Register for Project Pitch
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CORE PARTNERS PREVIEW ===== */}
      <section className="bg-gray-50/70 py-12 sm:py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            <span className="she-category-tag">Powered By</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Our Esteemed <span className="she-gradient-text">Partners</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              ShePitch is brought to life through the collaborative support of industry and academic pioneers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="she-partner-card py-6 sm:py-8">
              <Image src="/assets/partners-imgs/part-4.png" alt="Ugham" width={140} height={70} className="she-partner-logo-img" />
              <span className="she-partner-label">Organized by</span>
            </div>
            <div className="she-partner-card py-6 sm:py-8">
              <Image src="/assets/partners-imgs/part-2.png" alt="Icebrkr" width={140} height={70} className="she-partner-logo-img" />
              <span className="she-partner-label">Powered by</span>
            </div>
            <div className="she-partner-card py-6 sm:py-8">
              <Image src="/assets/partners-imgs/part-3.png" alt="Altruisty" width={140} height={70} className="she-partner-logo-img" />
              <span className="she-partner-label">Industry Partner</span>
            </div>
            <div className="she-partner-card py-6 sm:py-8">
              <Image src="/assets/partners-imgs/part-1.png" alt="Jeppiaar University" width={140} height={70} className="she-partner-logo-img" />
              <span className="she-partner-label">Venue Partner</span>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link href="/partners" className="she-btn-outline text-xs">
              View All Partners & Opportunities <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION BANNER ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="she-gradient-bg rounded-3xl p-6 sm:p-14 text-white text-center space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            Ready to Take Your Pitch to the Next Level?
          </h2>
          <p className="text-white/90 text-sm sm:text-lg max-w-2xl mx-auto">
            Join 1,000+ women innovators across India. Showcase your idea at Jeppiaar University on 19 September 2026.
          </p>
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/register" className="bg-white text-[#6C3B8F] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-full uppercase text-xs sm:text-sm tracking-wide shadow-lg transition-all text-center">
              Register Team Now
            </Link>
            <Link href="/timeline" className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full uppercase text-xs sm:text-sm tracking-wide transition-all text-center">
              View Event Timeline
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
