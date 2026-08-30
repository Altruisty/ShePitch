'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import BackToTop from '@/components/BackToTop';

import Preloader from '@/components/Preloader';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isPanelRoute = pathname.startsWith('/admin') || pathname.startsWith('/college');

  if (isPanelRoute) {
    return (
      <>
        <CustomCursor />
        {children}
      </>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Light Pink & Purple Ambient Background Gradient Glows Across All Pages */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[950px] md:w-[1200px] h-[450px] sm:h-[650px] bg-gradient-to-tr from-[#E83E8C]/20 via-[#6C3B8F]/15 to-transparent blur-[120px] sm:blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-24 w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] bg-gradient-to-br from-[#E83E8C]/18 via-[#6C3B8F]/12 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-10 -left-24 w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] bg-gradient-to-tr from-[#6C3B8F]/15 via-[#E83E8C]/18 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <Preloader />
      <CustomCursor />
      <Navbar />
      <main className="flex-grow pt-16 sm:pt-20 relative z-0">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
