'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0D0D12] text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-xl w-fit">
              <Image
                src="/assets/logo/icon.png"
                alt="ShePitch Logo"
                width={150}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A national platform created by UGHAM empowering women students to pitch innovative ideas, showcase projects, and connect with industry leaders.
            </p>
            <div className="flex items-center gap-2 text-[#E83E8C] font-semibold text-sm">
              <Globe className="w-4 h-4" />
              <span>Grand Finale: Chennai, India</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-200">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About ShePitch</Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">Competition Categories</Link>
              </li>
              <li>
                <Link href="/timeline" className="hover:text-white transition-colors">Timeline & Dates</Link>
              </li>
              <li>
                <Link href="/prizes" className="hover:text-white transition-colors">Prizes & Rewards</Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-white transition-colors">Partners & Sponsors</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">Register Now</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Event Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-200">Event Info</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E83E8C] shrink-0 mt-0.5" />
                <span>
                  <strong>Venue Partner:</strong><br />
                  Jeppiaar University, Chennai
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#E83E8C] mt-2 shrink-0" />
                <span>
                  <strong>Prize Pool:</strong> ₹1,00,000 Total
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#6C3B8F] mt-2 shrink-0" />
                <span>
                  <strong>Registration Fee:</strong> ₹299 per participant
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-200">Contact Us</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#E83E8C] shrink-0" />
                <a href="mailto:info@ugham.com" className="hover:text-white transition-colors">info@ugham.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#E83E8C] shrink-0" />
                <a href="tel:+918667839838" className="hover:text-white transition-colors">+91 86678 39838</a>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/register" className="she-btn-primary w-full justify-center text-center text-xs">
                Register Your Team
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/80 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 ShePitch. All Rights Reserved. Powered by Icebrkr & UGHAM.</p>
        </div>
      </div>
    </footer>
  );
}
