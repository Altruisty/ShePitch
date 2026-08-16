'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Phone, Mail, Globe } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Categories', href: '/categories' },
    { label: 'Timeline', href: '/timeline' },
    { label: 'Prizes', href: '/prizes' },
    { label: 'Partners', href: '/partners' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
            : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">
                <Image
                  src="/assets/logo/icon.png"
                  alt="ShePitch Logo"
                  width={140}
                  height={45}
                  className="h-8 sm:h-9 w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation (Only visible on Large / lg screens 1024px and wider) */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`font-semibold text-sm transition-all duration-200 relative ${
                      isActive
                        ? 'text-[#6C3B8F] font-bold'
                        : 'text-gray-700 hover:text-[#6C3B8F]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#6C3B8F] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* CTA Button & Mobile/Tablet Menu Button */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/register" className="hidden lg:inline-flex she-btn-primary text-xs px-6 py-2.5">
                Register Now
              </Link>

              {/* Hamburger Button (Visible on screens < 1024px including tablets and mobiles) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-[#6C3B8F]" />
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
            
            {/* Top Container: Header + Menu items + CTA */}
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
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
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
                      className={`px-4 py-3 rounded-xl font-bold text-base transition-all ${
                        isActive
                          ? 'bg-[#6C3B8F]/10 text-[#6C3B8F]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-[#6C3B8F]'
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
                  className="she-btn-primary w-full justify-center text-center py-3.5 shadow-lg"
                >
                  Register Now <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Bottom Container: Contact Info (Stacked Vertically Below) */}
            <div className="border-t border-gray-100 pt-6 mt-8 space-y-3">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">Contact Info</h4>
              <div className="space-y-2.5 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <a href="tel:+918667839838" className="hover:text-[#6C3B8F] font-semibold">
                    +91 86678 39838
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a href="mailto:info@ugham.com" className="hover:text-[#6C3B8F] font-semibold">
                    info@ugham.com
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">ShePitch &bull; UGHAM</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
