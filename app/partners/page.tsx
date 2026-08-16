'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Handshake, Building2, Utensils, Camera, ShoppingBag, Store, Users, DollarSign, ArrowRight } from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function PartnersPage() {
  const mainPartners = [
    {
      name: 'Ugham',
      role: 'Organized by',
      img: '/assets/partners-imgs/part-4.png',
    },
    {
      name: 'Icebrkr',
      role: 'Powered by',
      img: '/assets/partners-imgs/part-2.png',
    },
    {
      name: 'Altruisty',
      role: 'Industry Partner',
      img: '/assets/partners-imgs/part-3.png',
    },
    {
      name: 'Jeppiaar University',
      role: 'Venue Partner',
      img: '/assets/partners-imgs/part-1.png',
    },
  ];

  const collabCategories = [
    {
      title: 'Sponsorship',
      desc: 'Support ShePitch through financial sponsorship and gain brand visibility across all platforms.',
      icon: DollarSign,
    },
    {
      title: 'Industry Partner',
      desc: 'Provide mentors, judges, and expert sessions. Connect with 80+ industry professionals.',
      icon: Building2,
    },
    {
      title: 'Investment Partner',
      desc: 'Offer funding opportunities and investor interactions for top-performing teams.',
      icon: Handshake,
    },
    {
      title: 'Ecosystem Partner',
      desc: 'Support the innovation ecosystem through mentorship, incubation, and startup support.',
      icon: Users,
    },
    {
      title: 'Community Partner',
      desc: 'Drive outreach, promotions, and participant registrations across your network.',
      icon: Users,
    },
    {
      title: 'Company Stall Partner',
      desc: 'Set up a stall at the Grand Finale for branding, industry engagement, and talent hiring.',
      icon: Store,
    },
    {
      title: 'Food Stall Partner',
      desc: 'Provide food and beverage services at the Grand Finale event.',
      icon: Utensils,
    },
    {
      title: 'Fashion / Accessories Partner',
      desc: 'Showcase your brand at the event and connect with women innovators.',
      icon: ShoppingBag,
    },
    {
      title: 'Media & Coverage Partner',
      desc: 'Provide media coverage, photography, videography, and press coverage for the event.',
      icon: Camera,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="she-category-tag">Our Ecosystem</span>
        <AnimatedTitle
          text="Powered By Innovation & Partners"
          gradientWords={['Innovation', 'Partners']}
          className="text-4xl sm:text-6xl font-extrabold text-gray-900"
        />
        <p className="text-gray-600 text-lg leading-relaxed">
          ShePitch is made possible through the support of our esteemed organizers, industry collaborators, and venue partners.
        </p>
      </div>

      {/* Main Partners Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">Featured Headline Partners</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {mainPartners.map((p, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="she-partner-card py-10"
            >
              <Image src={p.img} alt={p.name} width={160} height={80} className="she-partner-logo-img" />
              <span className="she-partner-label mt-2">{p.role}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
