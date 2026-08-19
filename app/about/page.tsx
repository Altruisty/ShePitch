'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, Users, GraduationCap, Trophy, Globe, Lightbulb, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function AboutPage() {
  const highlights = [
    {
      title: 'Pan-India Participation',
      desc: 'Open to women students across India from engineering, technology, design, and management backgrounds.',
      icon: Globe,
    },
    {
      title: '50+ College Collaborations',
      desc: 'Expanding academic partnerships nationwide to bring emerging talent into the spotlight.',
      icon: GraduationCap,
    },
    {
      title: '1000+ Women Participants',
      desc: 'Empowering emerging female leaders and visionaries to turn concepts into real-world impact.',
      icon: Users,
    },
    {
      title: '80+ Industry Experts & Mentors',
      desc: 'Direct guidance, feedback, and networking opportunities with seasoned tech leaders.',
      icon: Award,
    },
    {
      title: 'Grand Finale on 19 Sept 2026',
      desc: 'Hosted live at Jeppiaar University, Chennai with offline pitches, keynotes, and award ceremony.',
      icon: Trophy,
    },
  ];

  const collegeBenefits = [
    {
      title: '₹100 Student Registration Discount',
      desc: 'Students from collaborating colleges receive an exclusive ₹100 discount per participant on the registration fee.',
      icon: Lightbulb,
    },
    {
      title: 'Shield of Recognition',
      desc: 'Collaborating institution receives a custom Shield of Recognition on the main stage during the Grand Finale.',
      icon: Trophy,
    },
    {
      title: 'Industry Access & Networking',
      desc: 'Direct interaction with 80+ industry experts, founders, and corporate leaders present at the event.',
      icon: Users,
    },
    {
      title: 'Startup & Prototype Mentorship',
      desc: 'Dedicated post-pitch mentorship to guide top student innovations towards incubation and launch.',
      icon: ShieldCheck,
    },
    {
      title: 'National Institutional Media Branding',
      desc: 'Institutional logo featured across official ShePitch promotions, media releases, and backdrop banners.',
      icon: Globe,
    },
    {
      title: 'Dedicated College Representative Portal',
      desc: 'Access a custom administrative portal to track, view, and manage all student team registrations from your institution.',
      icon: Building2,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="she-category-tag">About ShePitch Chennai</span>
        <AnimatedTitle
          text="Empowering Women Innovators Across India"
          gradientWords={['Women', 'Innovators']}
          mobileBreakWords={['Empowering', 'Women', 'Innovators']}
          className="text-4xl sm:text-6xl font-extrabold text-gray-900"
        />
        <p className="text-gray-600 text-lg leading-relaxed">
          ShePitch is a premier women-focused innovation competition created by <strong className="text-gray-900">UGHAM</strong> to give women students a national stage to pitch ideas, demonstrate prototypes, and launch tech careers.
        </p>
      </div>

      {/* Main Grid: Overview & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Overview & Stats */}
        <div className="lg:col-span-6 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Mission & Purpose</h3>
            <p className="text-gray-600 leading-relaxed text-base">
              At ShePitch, we believe that innovation thrives when diverse voices are empowered. Our mission is to bridge the gap between academic innovation and industry implementation by providing women students with mentorship, capital, and visibility.
            </p>
            <p className="text-gray-600 leading-relaxed text-base">
              Whether you have an early napkin sketch or a fully functioning hardware/software MVP, ShePitch offers tailored tracks to showcase your vision to investors and tech executives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
              <span className="block text-3xl sm:text-4xl font-extrabold she-gradient-text">₹1,00,000</span>
              <span className="text-sm font-semibold text-gray-600">Total Prize Pool</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
              <span className="block text-3xl sm:text-4xl font-extrabold she-gradient-text">₹299</span>
              <span className="text-sm font-semibold text-gray-600">Fee per Participant</span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Highlights */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-2xl font-bold text-gray-900">Key Highlights</h3>
          </div>

          <div className="space-y-4">
            {highlights.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition-colors">
                  <div className="she-svg-icon-wrapper shrink-0">
                    <IconComp className="w-5 h-5 text-[#6C3B8F]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== COLLEGE COLLABORATION SECTION ===== */}
      <div className="bg-gradient-to-br from-[#6C3B8F]/5 to-[#E83E8C]/5 rounded-3xl p-8 sm:p-12 border border-[#6C3B8F]/15 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="she-category-tag">Institution Partner</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            College <span className="she-gradient-text">Collaboration</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Colleges across India can become official ShePitch College Collaborators to empower their female students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Nomination Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md space-y-6">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">College Nomination</h4>
              <p className="text-sm text-gray-500">Each collaborating college can nominate student teams:</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 text-center border border-gray-100">
                <span className="text-xs font-bold text-[#6C3B8F] uppercase block">Minimum</span>
                <span className="text-2xl font-extrabold text-gray-900">10 Teams</span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 text-center border border-gray-100">
                <span className="text-xs font-bold text-[#E83E8C] uppercase block">Maximum</span>
                <span className="text-2xl font-extrabold text-gray-900">20 Teams</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">College Representative Requirement:</h4>
              <p className="text-xs text-gray-600 mb-3">At least 1 official representative from the college should attend the Grand Finale:</p>
              <div className="flex flex-wrap gap-2">
                {['HOD', 'Placement Director', 'Dean', 'Principal', 'Chairman'].map((role) => (
                  <span key={role} className="px-3 py-1 bg-[#6C3B8F]/10 text-[#6C3B8F] font-bold text-xs rounded-full">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Why Partner with ShePitch?</h3>
            <div className="space-y-3">
              {collegeBenefits.slice(0, 3).map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3B8F] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{benefit.title}</h5>
                    <p className="text-xs text-gray-600 mt-0.5">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="pt-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Complete Institutional Benefits</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collegeBenefits.map((b, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="she-svg-icon-wrapper mb-3">
                  <b.icon className="w-5 h-5 text-[#6C3B8F]" />
                </div>
                <h4 className="font-bold text-gray-900 text-base">{b.title}</h4>
                <p className="text-xs text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
