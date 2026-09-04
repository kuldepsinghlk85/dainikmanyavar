'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  PlusCircle,
  Tag as TagIcon,
  FolderTree,
  MapPin,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  Image as ImageIcon,
  Video,
  Inbox,
  Radio,
  History,
  Archive,
  FolderArchive,
  Trophy,
  Sparkles,
  TrendingUp,
  Coins,
  ChevronDown,
  ChevronRight,
  Edit3,
  Sliders,
  Flame,
  Globe,
  Compass,
  FileText,
} from 'lucide-react';

interface AdminSidebarProps {
  userName: string;
  userRole: string;
}

export default function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQueryStr = searchParams.toString();
  const currentFullUrl = currentQueryStr ? `${pathname}?${currentQueryStr}` : pathname;

  const sections = [
    {
      id: 'editor-workspace',
      title: '✍️ संपादक वर्कस्पेस (Editor Workspace)',
      icon: Edit3,
      items: [
        { label: 'डैशबोर्ड (Dashboard)', href: '/admin', icon: LayoutDashboard },
        { label: 'सभी समाचार (All News)', href: '/admin/news', icon: Newspaper },
        { label: 'नया समाचार जोड़ें', href: '/admin/news/new', icon: PlusCircle },
        { label: '🔥 ब्रेकिंग न्यूज़ टिकर (Breaking Ticker)', href: '/admin/breaking', icon: Flame },
        { label: '📥 न्यूज़ इम्पोर्ट इनबॉक्स', href: '/admin/importer/inbox', icon: Inbox },
        { label: '📥 विशेष फ़ीड इनबॉक्स', href: '/admin/external-content/inbox', icon: Radio },
        { label: '📦 आर्काइव्ड समाचार (Archive)', href: '/admin/archive/news', icon: Archive },
      ],
    },
    {
      id: 'epaper-management',
      title: '📰 E-Paper Management',
      icon: Newspaper,
      items: [
        { label: 'Upload New Edition', href: '/admin/epaper/upload', icon: PlusCircle },
        { label: 'Published Editions', href: '/admin/epaper/published', icon: Newspaper },
        { label: 'Draft Editions', href: '/admin/epaper/drafts', icon: Edit3 },
        { label: 'Page Management', href: '/admin/epaper/pages', icon: FolderTree },
        { label: 'Advertisement Management', href: '/admin/epaper/ads', icon: Megaphone },
        { label: 'E-Paper Analytics', href: '/admin/epaper/analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'rss-library',
      title: '📡 RSS Feed Library',
      icon: Radio,
      items: [
        { label: 'All RSS Sources', href: '/admin/rss/sources', icon: Sliders },
        { label: 'Cricket Feeds', href: '/admin/rss/sources?category=Cricket', icon: Trophy },
        { label: 'Rashifal Feeds', href: '/admin/rss/sources?category=Rashifal', icon: Sparkles },
        { label: 'Stock Market Feeds', href: '/admin/rss/sources?category=Stock Market', icon: TrendingUp },
        { label: 'Gold Silver Feeds', href: '/admin/rss/sources?category=Gold Silver', icon: Coins },
        { label: 'UP / North India Feeds', href: '/admin/rss/sources?region=Uttar Pradesh', icon: Globe },
        { label: 'Import Inbox', href: '/admin/importer/inbox', icon: Inbox },
        { label: 'Sync History', href: '/admin/rss/history', icon: History },
      ],
    },
    {
      id: 'special-modules',
      title: '🏆 विशेष मॉड्यूल्स (Special Modules)',
      icon: Trophy,
      items: [
        { label: '🏏 क्रिकेट (Cricket Matches)', href: '/admin/cricket', icon: Trophy },
        { label: '🔮 राशिफल (Horoscope)', href: '/admin/horoscope', icon: Sparkles },
        { label: '📈 शेयर बाजार (Stock Market)', href: '/admin/stock-market', icon: TrendingUp },
        { label: '🪙 सोना-चांदी भाव (Gold-Silver)', href: '/admin/gold-silver', icon: Coins },
        { label: '🎛️ विगेट्स ऑन/ऑफ (Homepage Control)', href: '/admin/homepage', icon: Sliders },
      ],
    },
    {
      id: 'admin-settings',
      title: '🛠️ मीडिया, टैक्सोनॉमी एवं प्रशासन',
      icon: Settings,
      items: [
        { label: '🖼️ मीडिया लाइब्रेरी (Media)', href: '/admin/media', icon: ImageIcon },
        { label: '🖼️ फोटो आर्काइवर (Image Link Copy)', href: '/admin/archive/media', icon: FolderArchive },
        { label: '📂 श्रेणियां (Categories)', href: '/admin/categories', icon: FolderTree },
        { label: '🏷️ मल्टी टैग्स (Multi-Tags)', href: '/admin/tags', icon: TagIcon },
        { label: '📍 स्थान (Locations)', href: '/admin/locations', icon: MapPin },
        { label: '🎥 वीडियो न्यूज़ (Videos)', href: '/admin/video', icon: Video },
        { label: '🔥 ब्रेकिंग टिकर (Ticker)', href: '/admin/breaking', icon: Flame },
        { label: '📢 विज्ञापन (Ads Manager)', href: '/admin/ads', icon: Megaphone },
        { label: '📊 एनालिटिक्स (Analytics)', href: '/admin/analytics', icon: BarChart3 },
        { label: '⚙️ साइट सेटिंग्स (Settings)', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Keep all sections open by default so admin can access everything instantly
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'editor-workspace': true,
    'epaper-management': true,
    'rss-library': true,
    'special-modules': true,
    'admin-settings': true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-stone-200 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="दैनिक मान्यवर"
            width={140}
            height={40}
            className="h-7 w-auto object-contain"
          />
          <span className="text-[10px] bg-[#EA580C] text-white px-1.5 py-0.5 rounded font-mono font-bold">
            CMS v2.0
          </span>
        </Link>
      </div>

      {/* Accordion Navigation Sections */}
      <nav className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
        {sections.map((section) => {
          const isOpen = !!openSections[section.id];

          return (
            <div key={section.id} className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
              {/* Accordion Header - Click to Extend/Collapse */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-3 text-xs font-black text-amber-400 bg-slate-900/80 hover:bg-slate-800 transition-colors text-left cursor-pointer border-b border-slate-800/50"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-orange-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
              </button>

              {/* Sub-menu Items */}
              {isOpen && (
                <div className="p-1.5 space-y-1 bg-slate-950/40 transition-all">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      currentFullUrl === item.href ||
                      (item.href.includes('?') && currentFullUrl.includes(item.href)) ||
                      (!item.href.includes('?') && pathname === item.href) ||
                      (item.href !== '/admin' && !item.href.includes('?') && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                          isActive
                            ? 'bg-[#EA580C] text-white shadow-md shadow-orange-950/40 font-black'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#EA580C] text-xs truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{userRole}</p>
          </div>
        </div>

        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="p-2 hover:bg-red-950/60 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            title="लॉगआउट करें"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
