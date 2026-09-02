'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#FFF1E6] text-[#3F2A1D] pt-8 pb-4 border-t-4 border-[#F97316]">
      <div className="wrap">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-7 mb-6">
          {/* Brand Info */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#C2410C] mb-2">दैनिक मान्यवर</h2>
            <p className="text-sm text-[#6B4A36] leading-relaxed mb-3">
              निष्पक्ष, तेज़ और भरोसेमंद खबरें। जनहित की आवाज, विकास और समाज के प्रति समर्पित डिजिटल समाचार मंच।
            </p>
            <p className="text-xs text-[#9A5A2E]">📍 जौनपुर, उत्तर प्रदेश, भारत</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#3F2A1D] mb-3 text-base">त्वरित लिंक</h4>
            <ul className="space-y-1.5 text-sm text-[#6B4A36]">
              <li><Link href="/" className="hover:text-[#F97316] transition-colors">होम</Link></li>
              <li><Link href="/category/latest" className="hover:text-[#F97316] transition-colors">ताजा खबर</Link></li>
              <li><Link href="/about" className="hover:text-[#F97316] transition-colors">हमारे बारे में</Link></li>
              <li><Link href="/contact" className="hover:text-[#F97316] transition-colors">संपर्क करें</Link></li>
              <li><Link href="/advertise" className="hover:text-[#F97316] transition-colors">विज्ञापन दरें</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-[#3F2A1D] mb-3 text-base">महत्वपूर्ण श्रेणियां</h4>
            <ul className="space-y-1.5 text-sm text-[#6B4A36]">
              <li><Link href="/category/uttar-pradesh" className="hover:text-[#F97316] transition-colors">उत्तर प्रदेश</Link></li>
              <li><Link href="/category/jaunpur" className="hover:text-[#F97316] transition-colors">जौनपुर</Link></li>
              <li><Link href="/category/rajneeti" className="hover:text-[#F97316] transition-colors">राजनीति</Link></li>
              <li><Link href="/category/shiksha" className="hover:text-[#F97316] transition-colors">शिक्षा</Link></li>
              <li><Link href="/category/swasthya" className="hover:text-[#F97316] transition-colors">स्वास्थ्य</Link></li>
            </ul>
          </div>

          {/* Editorial Policies */}
          <div>
            <h4 className="font-bold text-[#3F2A1D] mb-3 text-base">नीतियां एवं नियम</h4>
            <ul className="space-y-1.5 text-sm text-[#6B4A36]">
              <li><Link href="/privacy" className="hover:text-[#F97316] transition-colors">गोपनीयता नीति</Link></li>
              <li><Link href="/terms" className="hover:text-[#F97316] transition-colors">नियम एवं शर्तें</Link></li>
              <li><Link href="/corrections-policy" className="hover:text-[#F97316] transition-colors">सुधार नीति</Link></li>
              <li><Link href="/editorial-policy" className="hover:text-[#F97316] transition-colors">Editorial Policy</Link></li>
              <li><Link href="/admin" className="hover:text-[#F97316] transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#FDBA74] pt-3 text-center text-xs text-[#9A5A2E]">
          © {new Date().getFullYear()} दैनिक मान्यवर. सर्वाधिकार सुरक्षित. | Powered by Dainik Manyawar Digital Network
        </div>
      </div>
    </footer>
  );
}
