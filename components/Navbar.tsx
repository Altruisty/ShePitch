'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Phone, Mail, Globe } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'ABOUT', href: '/about' },
    { label: 'CATEGORIES', href: '/categories' },
    { label: 'TIMELINE', href: '/timeline' },
    { label: 'PRIZES', href: '/prizes' },
    { label: 'PARTNERS', href: '/partners' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 pt-3 sm:pt-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Floating White Pill Container */}
          <div className="bg-white rounded-full px-5 sm:px-8 py-2.5 sm:py-3 shadow-xl shadow-purple-950/10 border border-gray-100 flex items-center justify-between backdrop-blur-md">
            
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Image
                src="/assets/logo/icon.png"
                alt="ShePitch Logo"
                width={140}
                height={45}
                className="h-8 sm:h-9 w-auto object-contain"
                priority
              />
            </Link>

            {/* Middle: Desktop Navigation Pill Links (Only visible on lg+ screens) */}
            <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'bg-[#2a173b] text-white px-5 py-2 rounded-full shadow-md'
                        : 'text-gray-800 hover:text-[#6C3B8F] px-4 py-2 rounded-full hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: REGISTER NOW CTA Button & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="border-2 border-[#6C3B8F] text-[#6C3B8F] hover:bg-[#6C3B8F] hover:text-white rounded-full px-5 sm:px-6 py-2 text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm shrink-0"
              >
                REGISTER NOW
              </Link>

              {/* Hamburger Button (Mobile / Tablet) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5 text-[#6C3B8F]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Offcanvas Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto z-10 transition-transform">
            
            {/* Top Container */}
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <Image
                  src="/assets/logo/icon.png"
                  alt="ShePitch Logo"
                  width={130}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`px-4 py-3 rounded-full font-extrabold text-sm uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-[#2a173b] text-white'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* CTA Button inside Mobile Menu */}
              <div className="pt-2">
                <Link
                  href="/register"
                  className="border-2 border-[#6C3B8F] text-[#6C3B8F] hover:bg-[#6C3B8F] hover:text-white rounded-full w-full justify-center text-center py-3 block font-extrabold text-xs uppercase tracking-wider transition-all"
                >
                  REGISTER NOW
                </Link>
              </div>
            </div>

            {/* Bottom Contact Info */}
            <div className="border-t border-gray-100 pt-6 mt-8 space-y-3">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">Contact Info</h4>
              <div className="space-y-2.5 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <a href="tel:+918667839838" className="hover:text-[#6C3B8F] font-semibold">
                    +91 86678 39838
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a href="mailto:info@ugham.com" className="hover:text-[#6C3B8F] font-semibold">
                    info@ugham.com
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
