'use client';

import React from 'react';
import Link from 'next/link';
import { X, User, ChevronRight, MapPin, Monitor, Phone, Info, Globe, Sparkles, Newspaper } from 'lucide-react';
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

/* Custom crisp SVG icons branded exclusively for Dainik Manyavar */
function TopNewsIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <path
        d="M17.5 3C17.5 3 20 8 18 12C20 10 22 8 22 8C22 8 25 13 22 19C21 21 19 23 16 23C12.5 23 10 20 10 16.5C10 12 13 8 17.5 3Z"
        fill="url(#flameGrad)"
      />
      <circle cx="16" cy="16" r="14" stroke="#E53935" strokeWidth="2.5" />
      <path
        d="M10 21L14 16L17 19L22 13M22 13H18.5M22 13V16.5"
        stroke="#E53935"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="flameGrad" x1="16" y1="3" x2="16" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StateCityIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 4C10.48 4 6 8.48 6 14C6 21 16 29 16 29C16 29 26 21 26 14C26 8.48 21.52 4 16 4Z"
        fill="#EF4444"
      />
      <circle cx="16" cy="13.5" r="4.5" fill="white" />
    </svg>
  );
}

function JaunpurIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      {/* Monument / Shahi Bridge arches */}
      <path d="M7 23V16C7 16 11 11 16 11C21 11 25 16 25 16V23" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 23V17C12 17 14 15 16 15C18 15 20 17 20 17V23" stroke="#B45309" strokeWidth="1.8" fill="#FDE68A" />
      <circle cx="16" cy="9" r="2" fill="#DC2626" />
    </svg>
  );
}

function LatestFlashIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect x="5" y="4" width="22" height="24" rx="4" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.8" />
      {/* Lightning bolt */}
      <path
        d="M17 8L10 17H16L14 24L22 14H16L17 8Z"
        fill="#DC2626"
      />
    </svg>
  );
}

function InvestigationEyeIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
      {/* Sleek Eye outline */}
      <path
        d="M6 16C6 16 10 9 16 9C22 9 26 16 26 16C26 16 22 23 16 23C10 23 6 16 6 16Z"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.5" fill="#B91C1C" />
      <circle cx="17.2" cy="14.8" r="1" fill="white" />
    </svg>
  );
}

function CricketIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="10" cy="10" r="5" fill="#DC2626" stroke="#B91C1C" strokeWidth="1" />
      {/* White seam stitches */}
      <path
        d="M7 8C8 10 10 12 13 13M7 11C8 12 10 13 12 14"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Bat with golden swoosh */}
      <path
        d="M15 13L25 8L26 10L17 15L15 13Z"
        fill="#F59E0B"
      />
      <path
        d="M6 21C11 20 18 20 25 24"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpecialStarIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 2L19.2 10.8L28 9L21.5 15.5L27 23L18 20.5L16 29L14 20.5L5 23L10.5 15.5L4 9L12.8 10.8L16 2Z"
        fill="url(#starGrad)"
        stroke="#EA580C"
        strokeWidth="1"
      />
      <circle cx="16" cy="16" r="3" fill="#FFFBEB" />
      <defs>
        <linearGradient id="starGrad" x1="16" y1="2" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DmOriginalIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      {/* Glowing sunburst */}
      <circle cx="16" cy="16" r="13" fill="#F59E0B" />
      <circle cx="16" cy="16" r="10.5" fill="#FEF3C7" />
      {/* Sun rays notches */}
      <path
        d="M16 1V4M16 28V31M1 16H4M28 16H31M5.4 5.4L7.5 7.5M24.5 24.5L26.6 26.6M5.4 26.6L7.5 24.5M24.5 7.5L26.6 5.4"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Fountain pen nib */}
      <path
        d="M16 8L20 18H12L16 8Z"
        fill="#1C1917"
      />
      <path
        d="M16 18V24M16 13V16"
        stroke="#F59E0B"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="13" r="1" fill="#F59E0B" />
    </svg>
  );
}

function PoliticsParliamentIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
      {/* Parliament Dome */}
      <path d="M16 7C12 7 9 10 9 14H23C23 10 20 7 16 7Z" fill="#1D4ED8" />
      {/* Pillars */}
      <path d="M9 16V22M12.5 16V22M16 16V22M19.5 16V22M23 16V22" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="7" y="22" width="18" height="3" rx="0.5" fill="#1E3A8A" />
    </svg>
  );
}

function JobEducationIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <path d="M16 4L3 10L16 16L29 10L16 4Z" fill="#334155" />
      <path d="M8 12.3V18.5C8 18.5 11 21.5 16 21.5C21 21.5 24 18.5 24 18.5V12.3" stroke="#1E293B" strokeWidth="2" fill="none" />
      <path d="M26 11V19" stroke="#EA580C" strokeWidth="1.5" />
      <circle cx="26" cy="19.5" r="1.5" fill="#EA580C" />
      <rect x="7" y="21" width="18" height="6" rx="2" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
      <path d="M15 21V27" stroke="#DC2626" strokeWidth="2.5" />
    </svg>
  );
}

function BusinessRupeeIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#16A34A" stroke="#15803D" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11" stroke="#86EFAC" strokeWidth="0.8" strokeDasharray="2 2" />
      <path
        d="M12 10H20M12 13.5H20M12 10V18C14 18 16.5 17.5 17.5 15.5C18.5 13.5 17 11 14.5 11M14 18L19.5 23"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DharmSanskritiIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.5" />
      {/* Diya Lamp */}
      <path d="M7 19C7 24 11 26 16 26C21 26 25 24 25 19H7Z" fill="#C2410C" />
      {/* Glowing Flame */}
      <path d="M16 6C16 6 13 11 13 14C13 16 14.5 17.5 16 17.5C17.5 17.5 19 16 19 14C19 11 16 6 16 6Z" fill="#F59E0B" />
      <circle cx="16" cy="14" r="1.5" fill="#FEF08A" />
    </svg>
  );
}

function VideshGlobeIcon() {
  return (
    <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
      {/* Equator & Meridians */}
      <ellipse cx="16" cy="16" rx="6.5" ry="13" stroke="#0284C7" strokeWidth="1.2" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="#0284C7" strokeWidth="1.2" />
      <line x1="6" y1="10" x2="26" y2="10" stroke="#0284C7" strokeWidth="1" strokeDasharray="1 1" />
      <line x1="6" y1="22" x2="26" y2="22" stroke="#0284C7" strokeWidth="1" strokeDasharray="1 1" />
    </svg>
  );
}

export default function MobileDrawer({
  isOpen,
  onClose,
  config = DEFAULT_MOBILE_MENU_CONFIG.drawer,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  // Dainik Manyavar Official Portal Menu Items
  const menuItems = [
    {
      id: 'top-news',
      title: 'टॉप न्यूज़ (होम)',
      href: '/mobile',
      icon: <TopNewsIcon />,
      isFeatured: true,
    },
    {
      id: 'state-up',
      title: 'उत्तर प्रदेश समाचार',
      href: '/mobile/category/uttar-pradesh',
      icon: <StateCityIcon />,
    },
    {
      id: 'jaunpur',
      title: 'जौनपुर हलचल',
      href: '/district/जौनपुर',
      icon: <JaunpurIcon />,
    },
    {
      id: 'latest-news',
      title: 'ताज़ा ख़बरें',
      href: '/mobile/category/latest',
      icon: <LatestFlashIcon />,
      badge: 'LIVE',
    },
    {
      id: 'dm-investigation',
      title: 'मान्यवर इन्वेस्टिगेशन (पड़ताल)',
      href: '/category/investigation',
      icon: <InvestigationEyeIcon />,
      badge: 'SPECIAL',
    },
    {
      id: 'rajneeti',
      title: 'राजनीति हलचल',
      href: '/mobile/category/rajneeti',
      icon: <PoliticsParliamentIcon />,
    },
    {
      id: 'dm-special',
      title: 'मान्यवर विशेष (खास)',
      href: '/category/special',
      icon: <SpecialStarIcon />,
    },
    {
      id: 'dm-original',
      title: 'DM ओरिजिनल',
      href: '/category/original',
      icon: <DmOriginalIcon />,
      badge: 'ORIGINAL',
    },
    {
      id: 'cricket',
      title: 'क्रिकेट व खेल',
      href: '/mobile/category/khel',
      icon: <CricketIcon />,
    },
    {
      id: 'job-education',
      title: 'शिक्षा एवं रोज़गार',
      href: '/mobile/category/shiksha',
      icon: <JobEducationIcon />,
    },
    {
      id: 'business',
      title: 'अर्थजगत व बिज़नेस',
      href: '/mobile/category/arthjagat',
      icon: <BusinessRupeeIcon />,
    },
    {
      id: 'dharm-sanskriti',
      title: 'धर्म एवं संस्कृति',
      href: '/mobile/category/dharm-sanskriti',
      icon: <DharmSanskritiIcon />,
    },
    {
      id: 'videsh',
      title: 'देश-विदेश',
      href: '/mobile/category/videsh',
      icon: <VideshGlobeIcon />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide Drawer */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#141414] text-stone-900 dark:text-stone-100 h-full shadow-2xl z-10 flex flex-col overflow-y-auto border-r border-stone-200 dark:border-stone-800 transition-colors">
        {/* Drawer Top Branding */}
        <div className="p-3.5 bg-gradient-to-r from-red-600 via-[#E53935] to-amber-600 text-white flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xl font-black tracking-tight block drop-shadow-xs">
              दैनिक मान्यवर
            </span>
            <p className="text-[10px] text-red-100 font-bold">
              निष्पक्ष • निर्भीक • विश्वसनीय
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/90 hover:text-white rounded-full active:bg-white/20 cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Bar */}
        <div className="p-2.5 bg-red-50/70 dark:bg-stone-900/80 border-b border-red-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E53935] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-black text-stone-900 dark:text-white leading-tight">पाठक प्रोफाइल</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">रजिस्टर / लॉगिन</p>
            </div>
          </div>
          <Link
            href="/user/dashboard"
            onClick={onClose}
            className="px-2.5 py-1 bg-[#E53935] text-white text-[11px] font-bold rounded-lg shadow-xs hover:bg-red-700"
          >
            खोलें
          </Link>
        </div>

        {/* Dainik Manyavar Official Menu Items */}
        <div className="p-2 space-y-0.5">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all active:scale-[0.99] ${
                item.isFeatured
                  ? 'bg-red-50/80 dark:bg-stone-800/90 font-black'
                  : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 font-bold'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {item.icon}
                <span className="text-[14.5px] text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                  {item.title}
                </span>
              </div>

              {item.badge && (
                <span className="bg-[#E53935] text-white text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Regional / Districts Quick Chips */}
        {config.showDistricts !== false && (
          <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h4 className="text-[11px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#E53935]" />
              <span>उत्तर प्रदेश जनपद समाचार</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {DISTRICTS.map((d) => (
                <Link
                  key={d}
                  href={`/district/${encodeURIComponent(d)}`}
                  onClick={onClose}
                  className="text-[11px] font-bold bg-white dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-700 dark:text-stone-300 hover:text-[#E53935] px-2.5 py-1 rounded-lg border border-stone-200/80 dark:border-stone-700 shadow-2xs"
                >
                  {d}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info & Desktop Switch */}
        <div className="p-3 bg-stone-50 dark:bg-[#181818] border-t border-stone-200 dark:border-stone-800 mt-auto space-y-2 text-xs font-semibold text-stone-600 dark:text-stone-400">
          {config.showDesktopSwitch !== false && (
            <Link
              href="/?view=desktop"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-800 dark:text-white font-black hover:bg-stone-100 dark:hover:bg-stone-700 active:scale-98 shadow-2xs"
            >
              <Monitor className="w-4 h-4 text-[#E53935]" />
              <span>🖥️ डेस्कटॉप वर्जन देखें</span>
            </Link>
          )}

          {config.showContact !== false && (
            <div className="flex justify-between items-center text-[11px] text-stone-500 dark:text-stone-400 pt-1">
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
