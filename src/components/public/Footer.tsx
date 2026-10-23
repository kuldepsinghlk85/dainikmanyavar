'use client';

import React from 'react';
import Link from 'next/link';
import { Youtube, Instagram, Facebook, Globe } from 'lucide-react';
import { OFFICIAL_SOCIAL_LINKS, OFFICIAL_HANDLES } from '@/lib/social';

export default function Footer() {
  return (
    <footer className="bg-[#FFF1E6] text-[#3F2A1D] pt-8 pb-4 border-t-4 border-[#F97316]">
      <div className="wrap">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-7 mb-6">
          {/* Brand Info & Official Social Badges */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#C2410C] mb-2">दैनिक मान्यवर</h2>
            <p className="text-sm text-[#6B4A36] leading-relaxed mb-3">
              निष्पक्ष, तेज़ और भरोसेमंद खबरें। जनहित की आवाज, विकास और समाज के प्रति समर्पित डिजिटल समाचार मंच।
            </p>
            <p className="text-xs text-[#9A5A2E] mb-3">📍 उत्तर प्रदेश, भारत</p>

            {/* Official Social Channels Row */}
            <div className="pt-2 border-t border-[#FDBA74]/60">
              <p className="text-xs font-bold text-[#C2410C] mb-2">ऑफिशियल सोशल मीडिया:</p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={OFFICIAL_SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#FF0000] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs"
                  title="YouTube: @DainikManyavarOfficial"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href={OFFICIAL_SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs"
                  title="Instagram: @dainikmanyavarofficial"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={OFFICIAL_SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs"
                  title="Facebook Page: दैनिक मान्यवर"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={OFFICIAL_SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs font-bold text-xs"
                  title="WhatsApp: +91 93361 81297"
                >
                  💬
                </a>
                <a
                  href={OFFICIAL_SOCIAL_LINKS.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#EA580C] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs"
                  title="वेबसाइट: dainikmanyavar.com"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links & Services */}
          <div>
            <h4 className="font-bold text-[#3F2A1D] mb-3 text-base">संपर्क एवं सेवाएं</h4>
            <ul className="space-y-2 text-sm text-[#6B4A36]">
              <li>
                <Link href="/contact" className="hover:text-[#EA580C] transition-colors font-semibold flex items-center gap-1 text-stone-800">
                  <span>📝 संपर्क करें (Contact Us)</span>
                </Link>
              </li>
              <li>
                <Link href="/contact?category=ADVERTISEMENT" className="hover:text-[#EA580C] transition-colors font-medium flex items-center gap-1">
                  <span>📢 विज्ञापन के लिए संपर्क करें</span>
                </Link>
              </li>
              <li>
                <Link href="/contact?category=NEWS_TIP" className="hover:text-[#EA580C] transition-colors font-medium flex items-center gap-1">
                  <span>📰 समाचार की सूचना दें</span>
                </Link>
              </li>
              <li>
                <Link href="/contact?category=CAREER" className="hover:text-[#EA580C] transition-colors font-medium flex items-center gap-1">
                  <span>💼 पत्रकारिता / रिपोर्टर आवेदन</span>
                </Link>
              </li>
              <li>
                <a
                  href={OFFICIAL_SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#16A34A] transition-colors font-semibold flex items-center gap-1 text-emerald-800"
                >
                  <span>📲 WhatsApp: 9336181297</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919336181297"
                  className="hover:text-[#EA580C] transition-colors font-semibold flex items-center gap-1"
                >
                  <span>📞 संपर्क: +91 93361 81297</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${OFFICIAL_SOCIAL_LINKS.email}`}
                  className="hover:text-[#EA580C] transition-colors text-xs flex items-center gap-1 text-stone-600 truncate max-w-[200px]"
                  title={OFFICIAL_SOCIAL_LINKS.email}
                >
                  <span>✉️ {OFFICIAL_SOCIAL_LINKS.email}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Active Categories with Content */}
          <div>
            <h4 className="font-bold text-[#3F2A1D] mb-3 text-base">महत्वपूर्ण श्रेणियां</h4>
            <ul className="space-y-2 text-sm text-[#6B4A36]">
              <li>
                <Link href="/category/uttar-pradesh" className="hover:text-[#F97316] transition-colors font-medium">
                  उत्तर प्रदेश
                </Link>
              </li>
              <li>
                <Link href="/category/desh" className="hover:text-[#F97316] transition-colors font-medium">
                  देश
                </Link>
              </li>
              <li>
                <Link href="/category/rajneeti" className="hover:text-[#F97316] transition-colors font-medium">
                  राजनीति
                </Link>
              </li>
              <li>
                <Link href="/category/shiksha" className="hover:text-[#F97316] transition-colors font-medium">
                  शिक्षा
                </Link>
              </li>
              <li>
                <Link href="/category/swasthya" className="hover:text-[#F97316] transition-colors font-medium">
                  स्वास्थ्य
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Policies */}
          <div>
            <h4 className="font-bold text-[#3F2A1D] mb-3 text-base">नीतियां एवं नियम</h4>
            <ul className="space-y-2 text-sm text-[#6B4A36]">
              <li>
                <span className="text-[#8C6D58]/60 cursor-not-allowed select-none" title="पृष्ठ अभी उपलब्ध नहीं है">
                  गोपनीयता नीति
                </span>
              </li>
              <li>
                <span className="text-[#8C6D58]/60 cursor-not-allowed select-none" title="पृष्ठ अभी उपलब्ध नहीं है">
                  नियम एवं शर्तें
                </span>
              </li>
              <li>
                <span className="text-[#8C6D58]/60 cursor-not-allowed select-none" title="पृष्ठ अभी उपलब्ध नहीं है">
                  सुधार नीति
                </span>
              </li>
              <li>
                <span className="text-[#8C6D58]/60 cursor-not-allowed select-none" title="पृष्ठ अभी उपलब्ध नहीं है">
                  Editorial Policy
                </span>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#F97316] transition-colors font-medium">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Technology Partner */}
        <div className="border-t border-[#FDBA74] pt-3 text-center text-xs text-[#9A5A2E] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span>© {new Date().getFullYear()} दैनिक मान्यवर. सर्वाधिकार सुरक्षित. | Powered by Dainik Manyawar Digital Network</span>
          <span className="hidden sm:inline text-[#FDBA74]">|</span>
          <span>
            Technology Partner:{' '}
            <a
              href="https://easylauncher.net"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-[#C2410C] transition-colors"
            >
              EasyLauncher.net
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
