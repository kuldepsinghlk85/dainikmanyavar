'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Home, Newspaper, Video, MapPin, Monitor, Phone, Info } from 'lucide-react';
import { DrawerConfig, DEFAULT_MOBILE_MENU_CONFIG } from '@/lib/mobileMenuDefaults';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: { name: string; slug: string }[];
  config?: DrawerConfig;
}

const DISTRICTS = [
  'जौनपुर', 'वाराणसी', 'प्रयागराज', 'गाजीपुर', 'आजमगढ़', 'मिर्जापुर', 'सोनभद्र', 'चंदौली', 'भदोही', 'बलिया', 'मऊ'
];

export default function MobileDrawer({
  isOpen,
  onClose,
  categories = [],
  config = DEFAULT_MOBILE_MENU_CONFIG.drawer,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  const showQuickLinks =
    config.homeLink !== false ||
    config.epaperLink !== false ||
    config.videoLink !== false;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide Drawer */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <Image
              src="/logo.png"
              alt="दैनिक मान्यवर"
              width={160}
              height={40}
              unoptimized
              className="h-9 w-auto object-contain brightness-0 invert"
            />
            <p className="text-[10px] text-orange-100 font-bold">
              निष्पक्ष एवं निर्भीक राष्ट्रीय हिंदी दैनिक
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-full active:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Main Links */}
        {showQuickLinks && (
          <div className="p-3 border-b border-stone-100 space-y-1 text-xs font-bold text-stone-800">
            {config.homeLink !== false && (
              <Link
                href="/mobile"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#EA580C]"
              >
                <Home className="w-4 h-4 text-[#EA580C]" />
                <span>होमपेज</span>
              </Link>
            )}

            {config.epaperLink !== false && (
              <Link
                href="/epaper"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#EA580C]"
              >
                <Newspaper className="w-4 h-4 text-[#EA580C]" />
                <span>डिजिटल ई-पेपर (Today's Paper)</span>
              </Link>
            )}

            {config.videoLink !== false && (
              <Link
                href="/video"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#EA580C]"
              >
                <Video className="w-4 h-4 text-[#EA580C]" />
                <span>वीडियो बुलेटिन</span>
              </Link>
            )}
          </div>
        )}

        {/* Districts Section */}
        {config.showDistricts !== false && (
          <div className="p-3 border-b border-stone-100 space-y-2">
            <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>जिला समाचार (Regional)</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {DISTRICTS.map((d) => (
                <Link
                  key={d}
                  href={`/district/${encodeURIComponent(d)}`}
                  onClick={onClose}
                  className="text-[11px] font-bold bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-[#EA580C] px-2.5 py-1 rounded-lg"
                >
                  {d}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        {config.showCategories !== false && (
          <div className="p-3 border-b border-stone-100 space-y-1.5 flex-1">
            <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
              श्रेणियां (Categories)
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs font-semibold text-stone-700">
              {categories.length > 0 ? (
                categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/mobile/category/${c.slug}`}
                    onClick={onClose}
                    className="px-2 py-1.5 rounded-lg hover:bg-stone-50 hover:text-[#EA580C]"
                  >
                    {c.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/mobile/category/latest" onClick={onClose} className="px-2 py-1.5 hover:text-[#EA580C]">ताजा खबर</Link>
                  <Link href="/mobile/category/uttar-pradesh" onClick={onClose} className="px-2 py-1.5 hover:text-[#EA580C]">उत्तर प्रदेश</Link>
                  <Link href="/mobile/category/rajneeti" onClick={onClose} className="px-2 py-1.5 hover:text-[#EA580C]">राजनीति</Link>
                  <Link href="/mobile/category/desh" onClick={onClose} className="px-2 py-1.5 hover:text-[#EA580C]">देश</Link>
                  <Link href="/mobile/category/shiksha" onClick={onClose} className="px-2 py-1.5 hover:text-[#EA580C]">शिक्षा</Link>
                  <Link href="/mobile/category/swasthya" onClick={onClose} className="px-2 py-1.5 hover:text-[#EA580C]">स्वास्थ्य</Link>
                  <Link href="/cricket" onClick={onClose} className="px-2 py-1.5 hover:text-[#EA580C]">क्रिकेट</Link>
                  <Link href="/horoscope" onClick={onClose} className="px-2 py-1.5 hover:text-[#EA580C]">राशिफल</Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer Info & Desktop Switch */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-2 text-xs font-semibold text-stone-600">
          {config.showDesktopSwitch !== false && (
            <Link
              href="/?view=desktop"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-stone-300 rounded-xl text-stone-800 font-black hover:bg-stone-100 active:scale-98 shadow-2xs"
            >
              <Monitor className="w-4 h-4 text-[#EA580C]" />
              <span>🖥️ डेस्कटॉप वर्जन देखें</span>
            </Link>
          )}

          {config.showContact !== false && (
            <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1">
              <Link href="/contact" onClick={onClose} className="hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" /> संपर्क
              </Link>
              <Link href="/contact" onClick={onClose} className="hover:underline flex items-center gap-1">
                <Info className="w-3 h-3" /> हमारे बारे में
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
