"use client"

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, MapPin, Instagram } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const date = new Date();
  const year = date.getFullYear();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="bg-darkRed text-white">
      <div className="w-[90%] px-4 max-sm:w-[95%] mx-auto py-12">
        {/* Hero Section - Simplified */}
        <div className="mb-12 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-light leading-relaxed">
            Pure, authentic spices for 
            <span className="text-yellow-400 font-medium"> every kitchen</span>
          </h2>
          <div className="mt-4 flex flex-col gap-2 text-sm md:text-base opacity-90">
            <div>✦ Zero delivery charges on bulk orders</div>
            <div>✦ No minimum order quantity</div>
            <div>✦ 100% pure and authentic spices</div>
          </div>
        </div>

        {/* Footer Links - Grid Layout */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 border-t border-white/10 pt-8">
          {/* Company Section */}
          <div className="border-b md:border-none border-white/10">
            <button
              className="flex items-center justify-between w-full py-3 md:py-0 md:mb-4"
              onClick={() => toggleSection('company')}
            >
              <h3 className="font-medium text-base">Company</h3>
              <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${
                expandedSection === 'company' ? 'rotate-180' : ''
              }`} />
            </button>
            <ul className={`space-y-2 overflow-hidden transition-all duration-300 ${
              expandedSection === 'company' ? 'max-h-40 pb-4' : 'max-h-0 md:max-h-full'
            }`}>
              <li><Link href="/about" className="opacity-80 hover:opacity-100 text-sm block py-1">About Us</Link></li>
              <li><Link href="/terms-and-conditions" className="opacity-80 hover:opacity-100 text-sm block py-1">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="opacity-80 hover:opacity-100 text-sm block py-1">Privacy Policy</Link></li>
              <li><Link href="/contact" className="opacity-80 hover:opacity-100 text-sm block py-1">Contact</Link></li>
              <li><Link href="/track-order" className="opacity-80 hover:opacity-100 text-sm block py-1">Track order</Link></li>
            </ul>
          </div>

          {/* Products Section */}
          <div className="border-b md:border-none border-white/10">
            <button
              className="flex items-center justify-between w-full py-3 md:py-0 md:mb-4"
              onClick={() => toggleSection('products')}
            >
              <h3 className="font-medium text-base">Products</h3>
              <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${
                expandedSection === 'products' ? 'rotate-180' : ''
              }`} />
            </button>
            <ul className={`space-y-2 overflow-hidden transition-all duration-300 ${
              expandedSection === 'products' ? 'max-h-40 pb-4' : 'max-h-0 md:max-h-full'
            }`}>
              <li><Link href="#category_section" className="opacity-80 hover:opacity-100 text-sm block py-1">Whole Spices</Link></li>
              <li><Link href="#category_section" className="opacity-80 hover:opacity-100 text-sm block py-1">Ground Spices</Link></li>
              <li><Link href="#category_section" className="opacity-80 hover:opacity-100 text-sm block py-1">Spice Blends</Link></li>
              <li><Link href="#category_section" className="opacity-80 hover:opacity-100 text-sm block py-1">Specialty Items</Link></li>
            </ul>
          </div>

          {/* Social & Location Section (Replacing Guides) */}
          <div className="border-b md:border-none border-white/10">
            <button
              className="flex items-center justify-between w-full py-3 md:py-0 md:mb-4"
              onClick={() => toggleSection('social')}
            >
              <h3 className="font-medium text-base">Connect With Us</h3>
              <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${
                expandedSection === 'social' ? 'rotate-180' : ''
              }`} />
            </button>
            <ul className={`space-y-4 overflow-hidden transition-all duration-300 ${
              expandedSection === 'social' ? 'max-h-40 pb-4' : 'max-h-0 md:max-h-full'
            }`}>
              <li>
                <Link 
                  href="https://maps.app.goo.gl/ZhoePbgvoHmdM3h69" 
                  target="_blank"
                  className="opacity-80 hover:opacity-100 text-sm flex items-center gap-2 py-1"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Find us on Google Maps</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="https://www.instagram.com/rais.spices/" 
                  target="_blank"
                  className="opacity-80 hover:opacity-100 text-sm flex items-center gap-2 py-1"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Follow on Instagram</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
          <div className="flex items-center gap-3">
            <Image width={60} height={60} src="/images/navbar_logo.PNG" alt="Rai's Spices Logo" className="rounded" />
            <span className="text-lg font-medium">Rai&apos;s Spices</span>
          </div>
          <div className="text-sm opacity-80">
            © {year} Rai&apos;s Spices. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}