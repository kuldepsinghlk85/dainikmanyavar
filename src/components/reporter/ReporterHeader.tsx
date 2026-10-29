'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  PlusCircle,
  Bell,
  LogOut,
  Globe,
  Youtube,
  Instagram,
  Facebook,
  ExternalLink,
  User,
  Clock,
  CheckCircle2,
  BadgeAlert,
  FileText,
  LayoutDashboard,
  Smartphone,
} from 'lucide-react';
import { OFFICIAL_SOCIAL_LINKS } from '@/lib/social';

interface ReporterHeaderProps {
  profile?: {
    fullName?: string;
    reporterId?: string;
    photo?: string | null;
    designation?: string;
    district?: string | null;
  } | null;
  stats?: {
    total?: number;
    pendingReview?: number;
    changesRequested?: number;
    approved?: number;
    published?: number;
    rejected?: number;
    unreadNotifications?: number;
  };
  onOpenNotifications?: () => void;
  onLogout?: () => void;
}

export default function ReporterHeader({
  profile,
  stats,
  onOpenNotifications,
  onLogout,
}: ReporterHeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentDate = mounted
    ? new Date().toLocaleDateString('hi-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'आज';

  const defaultLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await fetch('/api/reporter/logout', { method: 'POST' });
        window.location.href = '/reporter/login';
      } catch (_) {
        window.location.href = '/reporter/login';
      }
    }
  };

  const navItems = [
    { label: 'डैशबोर्ड', href: '/reporter', icon: LayoutDashboard },
    { label: 'नई खबर भेजें', href: '/reporter/news/new', icon: PlusCircle, highlight: true },
    { label: 'मोबाइल व्यू 📱', href: '/mobile-reporter', icon: Smartphone },
    { label: 'मेरी प्रोफाइल', href: '/reporter/profile', icon: User },
  ];

  return (
    <header className="bg-white border-b border-stone-200 shadow-xs">
      {/* 1. Website Style Top Bar */}
      <div className="bg-[#FFF7ED] border-b border-[#FED7AA] text-xs font-sans text-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center py-1.5 gap-2">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="font-medium">📅 {currentDate}</span>
            <span className="text-stone-300">|</span>
            <span className="font-semibold text-orange-800">
              📍 {profile?.district || 'उत्तर प्रदेश'} (ब्यूरो डेस्क)
            </span>
            <span className="hidden md:inline text-stone-300">|</span>

            {/* Social Links */}
            <div className="hidden md:flex items-center gap-1.5 pl-1">
              <span className="text-[10px] text-stone-400 font-bold">फॉलो करें:</span>
              <a
                href={OFFICIAL_SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF0000] hover:scale-110 transition-transform"
                title="यूट्यूब"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href={OFFICIAL_SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E4405F] hover:scale-110 transition-transform"
                title="इंस्टाग्राम"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={OFFICIAL_SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1877F2] hover:scale-110 transition-transform"
                title="फेसबुक"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={OFFICIAL_SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:scale-110 transition-transform"
                title="व्हाट्सएप"
              >
                💬
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-stone-600 hover:text-[#EA580C] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>मुख्य वेबसाइट देखें</span>
            </Link>
            <span className="text-stone-300">|</span>
            <Link
              href="/epaper"
              target="_blank"
              className="inline-flex items-center gap-1 text-stone-600 hover:text-[#EA580C] transition-colors"
            >
              <span>ई-पेपर</span>
            </Link>
            <span className="text-stone-300">|</span>
            <Link
              href="/mobile-reporter"
              className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-950 bg-orange-100 hover:bg-orange-200 px-2 py-0.5 rounded-full font-bold transition-all"
              title="मोबाइल रिपोर्टर इंटरफेस खोलें"
            >
              <Smartphone className="w-3 h-3 text-orange-600" />
              <span>मोबाइल व्यू</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header with Logo, Tagline & Reporter Corner Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Dainik Manyavar Official Logo & Brand Area */}
        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
          <Link href="/reporter" className="inline-flex flex-col items-center md:items-start group select-none">
            <Image
              src="/logo.png"
              alt="दैनिक मान्यवर"
              width={350}
              height={90}
              priority
              unoptimized
              className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-[1.01]"
            />
            <p className="text-[10px] sm:text-[11px] font-bold text-stone-600 tracking-wider font-serif border-t border-stone-200 pt-0.5 w-full text-center md:text-left">
              सब पर नजर  सबकी खबर
            </p>
          </Link>

          {/* Reporter Corner Badge */}
          <div className="border-l-2 border-orange-400/40 pl-3 hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[11px] font-black tracking-wide shadow-xs uppercase">
                रिपोर्टर कॉर्नर
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-semibold mt-0.5">
              संवाददाता प्रबंधन व समाचार प्रकाशन
            </p>
          </div>
        </div>

        {/* Right Action & Profile Area */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
          {/* Mobile View CTA */}
          <Link
            href="/mobile-reporter"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition-all shadow-2xs"
            title="मोबाइल रिपोर्टर इंटरफेस पर जाएं"
          >
            <Smartphone className="w-4 h-4 text-[#EA580C]" />
            <span className="hidden sm:inline">मोबाइल व्यू</span>
          </Link>

          {/* Send News CTA */}
          <Link
            href="/reporter/news/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नई खबर भेजें</span>
          </Link>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
            title="सूचनाएं देखें"
          >
            <Bell className="w-4 h-4" />
            {(stats?.unreadNotifications || 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-xs">
                {stats?.unreadNotifications}
              </span>
            )}
          </button>

          {/* Reporter Profile Pill */}
          <Link
            href="/reporter/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all text-xs"
            title="मेरी प्रोफाइल देखें"
          >
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs overflow-hidden border border-orange-200 shrink-0">
              {profile?.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.fullName || 'रिपोर्टर'}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile?.fullName?.slice(0, 1) || 'र'
              )}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="font-bold text-stone-900 truncate max-w-[120px]">
                {profile?.fullName || 'संवाददाता'}
              </p>
              <p className="text-[10px] font-mono font-bold text-orange-600">
                {profile?.reporterId || 'DM-REP'}
              </p>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={defaultLogout}
            className="p-2.5 rounded-xl border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
            title="लॉगआउट करें"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Sub-Navigation Menu Bar (वेबसाइट जैसा नेविगेशन स्ट्रिप) */}
      <div className="bg-stone-900 text-white text-xs font-bold border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : item.highlight
                      ? 'text-orange-400 hover:text-white hover:bg-stone-800'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats in Navigation Strip */}
          {stats && (
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-stone-400 shrink-0 font-medium pl-4 border-l border-stone-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>समीक्षा लंबित:</span>
                <strong className="text-white font-mono">{stats.pendingReview || 0}</strong>
              </span>
              <span className="flex items-center gap-1">
                <BadgeAlert className="w-3 h-3 text-orange-400" />
                <span>सुधार हेतु:</span>
                <strong className="text-white font-mono">{stats.changesRequested || 0}</strong>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span>स्वीकृत:</span>
                <strong className="text-white font-mono">{stats.approved || 0}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>प्रकाशित:</span>
                <strong className="text-white font-mono">{stats.published || 0}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
