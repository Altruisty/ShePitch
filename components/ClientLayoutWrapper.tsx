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
        <main className="flex-grow">{children}</main>
      </>
    );
  }

  return (
    <>
      <Preloader />
      <CustomCursor />
      <Navbar />
      <main className="flex-grow pt-16 sm:pt-20">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
